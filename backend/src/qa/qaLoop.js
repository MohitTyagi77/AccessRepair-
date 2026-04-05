const path = require('path');
// Ensure env is loaded first and QA_MODE is set
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
process.env.QA_MODE = 'true';

const fs = require('fs');
const testUrls = require('./testUrls');
const Evaluator = require('./evaluator');
const { scanUrl } = require('../services/scanService');
const { getAIProvider } = require('../services/ai/aiProvider');

const MAX_EPOCHS = 3;
const TARGET_AVG_SCORE = 8.0;
const TARGET_FAILURE_RATE = 0.1; // 10%

// Delay helper to respect free-tier API rate limits (15 RPM -> 4s per request)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function runQALoop() {
    console.log("🚀 Starting AccessRepair QA Auto-Improvement Loop...");
    const evaluator = new Evaluator();
    const aiProvider = getAIProvider();

    for (let epoch = 1; epoch <= MAX_EPOCHS; epoch++) {
        console.log(`\n=================================================`);
        console.log(`                 EPOCH ${epoch}`);
        console.log(`=================================================`);

        let totalFixes = 0;
        let totalScore = 0;
        let failures = [];
        let epochDataset = [];

        for (const url of testUrls) {
            console.log(`\n🔍 Scanning ${url}...`);
            try {
                // We pass a dummy function for SSE progress
                const scanResult = await scanUrl(url, () => { });
                console.log(`   Found ${scanResult.violations.length} violations. Original Score: ${scanResult.score}/100`);

                // Process up to 2 violations per URL to optimize QA loop time and token usage
                const vSubset = scanResult.violations.slice(0, 2);
                if (vSubset.length === 0) continue;

                console.log(`   🤖 Generating AI fixes for ${vSubset.length} violations (delaying to respect rate limits)...`);
                await delay(4000); // Rate limit buffer
                const fixes = await aiProvider.generateFixes(vSubset);

                for (let i = 0; i < vSubset.length; i++) {
                    const violation = vSubset[i];
                    const fix = fixes[i];

                    process.stdout.write(`   🧪 Evaluating fix ${i + 1}/${vSubset.length} (waiting 4s for quota)... `);
                    await delay(4000); // Rate limit buffer
                    const evalResult = await evaluator.evaluateFix(violation, fix);
                    console.log(`Score: ${evalResult.score}/10 | Failure: ${evalResult.failureType}`);

                    totalFixes++;
                    totalScore += evalResult.score;
                    if (evalResult.failureType !== 'none' && evalResult.failureType !== 'unknown') {
                        failures.push(evalResult);
                    }

                    epochDataset.push({
                        url,
                        violationDescription: violation.description,
                        originalHtml: violation.html,
                        fixedHtml: fix.fixedHtml,
                        evaluation: evalResult
                    });
                }
            } catch (err) {
                console.error(`   ❌ Error processing ${url}:`, err.message);
            }
        }

        // Epoch Summary
        const avgScore = totalFixes > 0 ? (totalScore / totalFixes) : 0;
        const failureRate = totalFixes > 0 ? (failures.length / totalFixes) : 0;

        console.log(`\n📊 == EPOCH ${epoch} SUMMARY ==`);
        console.log(`Total Fixes Evaluated: ${totalFixes}`);
        console.log(`Average Fix Score: ${avgScore.toFixed(2)} / 10`);
        console.log(`Failure Rate: ${(failureRate * 100).toFixed(1)}%`);

        // Write dataset and report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(__dirname, `qa_report_epoch${epoch}_${timestamp}.md`);
        const datasetPath = path.join(__dirname, `qa_dataset_epoch${epoch}_${timestamp}.json`);

        fs.writeFileSync(datasetPath, JSON.stringify(epochDataset, null, 2));

        // Generate Architecture Suggestions
        console.log(`\n💡 Generating architecture improvement suggestions...`);
        const suggestions = await evaluator.generateArchitectureSuggestions(epochDataset);

        const reportContent = `# QA Epoch ${epoch} Report\n\n` +
            `- **Evaluated At**: ${new Date().toLocaleString()}\n` +
            `- **Average Score**: ${avgScore.toFixed(2)} / 10\n` +
            `- **Failure Rate**: ${(failureRate * 100).toFixed(1)}%\n` +
            `- **Total Fixes Evaluated**: ${totalFixes}\n\n` +
            `## Top Failures Detected\n` +
            failures.slice(0, 10).map(f => `- **${f.failureType}**: ${f.explanation}`).join('\n') + `\n\n` +
            `## System Architecture Suggestions\n\n` +
            `### Scoring Validation\n${suggestions.scoring}\n\n` +
            `### Priority Engine Validation\n${suggestions.priority}\n`;

        fs.writeFileSync(reportPath, reportContent);
        console.log(`\n💾 Saved Dataset: ${path.basename(datasetPath)}\n📄 Saved Report: ${path.basename(reportPath)}`);

        if (avgScore >= TARGET_AVG_SCORE && failureRate <= TARGET_FAILURE_RATE) {
            console.log("\n✅ Target metrics achieved! Auto-improvement loop complete.");
            break;
        }

        if (epoch < MAX_EPOCHS) {
            console.log("\n⚠️ Metrics below target. Initiating Prompt Optimization Loop...");
            const promptPath = path.join(__dirname, '../services/ai/basePrompt.txt');
            const currentPrompt = fs.readFileSync(promptPath, 'utf8');

            // Deduplicate failure types for prompt improvement logic
            const distinctFailures = [...new Map(failures.map(item => [item.failureType, item])).values()];

            console.log(`   Brainstorming improved prompt using ${distinctFailures.length} unique failure patterns...`);
            const newPrompt = await evaluator.improvePrompt(distinctFailures.map(f => ({ type: f.failureType, explanation: f.explanation })), currentPrompt);

            if (newPrompt && newPrompt !== currentPrompt) {
                console.log("   ✨ Successfully synthesized improved prompt. Overwriting basePrompt.txt...");
                fs.writeFileSync(promptPath, newPrompt);
            } else {
                console.log("   ❌ AI failed to generate a meaningfully different prompt. Halting multi-epoch execution.");
                break;
            }
        }
    }
    console.log("\n🏁 QA Loop Finished.");
    process.exit(0);
}

runQALoop().catch(err => {
    console.error("Fatal Error in QA Loop:", err);
    process.exit(1);
});
