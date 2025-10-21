# 🏠 Decentralized Freelance Marketplace
Welcome to **GigChain** - a trustless freelance platform on Stacks blockchain that eliminates payment disputes, fake reviews, and middleman fees! Hire talent securely with escrow, milestone payments, and automated dispute resolution.

## ✨ Features
🔒 **Escrow Protection** - Funds locked until work is approved  
💼 **Milestone Payments** - Pay in stages for large projects  
⚖️ **Automated Arbitration** - Smart contract resolves disputes  
⭐ **Verified Reviews** - Only completed jobs get ratings  
📊 **Reputation System** - On-chain freelancer scores  
💰 **No Platform Fees** - Direct P2P transactions  
🔍 **Work Proof** - IPFS file verification  

## 🛠 How It Works
**For Clients**
1. Post job with budget & milestones  
2. Hire freelancer → Funds auto-escrow  
3. Approve milestones → Auto-release payment  
4. Dispute? Submit to arbitration  

**For Freelancers**
1. Browse/bid on verified jobs  
2. Submit work → Client approves  
3. Get paid instantly upon approval  
4. Build reputation for better gigs  

## 📋 Smart Contracts (8 Total)

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| `gig-marketplace` | Core marketplace | `create-job`, `hire-freelancer`, `complete-job` |
| `escrow-vault` | Payment protection | `lock-funds`, `release-funds`, `refund` |
| `milestone-manager` | Staged payments | `add-milestone`, `approve-milestone`, `release-milestone` |
| `dispute-resolution` | Automated arbitration | `raise-dispute`, `submit-evidence`, `resolve-dispute` |
| `reputation-system` | Freelancer ratings | `submit-review`, `calculate-score`, `get-reputation` |
| `job-board` | Job listings | `post-job`, `cancel-job`, `get-active-jobs` |
| `bid-manager` | Freelancer bids | `submit-bid`, `withdraw-bid`, `accept-bid` |
| `ipfs-verifier` | Work verification | `verify-file-hash`, `submit-deliverable` |

## 🚀 Quick Start
```bash
# Clone & install
git clone <repo>
cd gigchain
npm install

# Deploy to testnet
clarinet deploy --testnet

# Test core flow
clarinet test
```

## 💡 Real-World Impact
- **$50B+** lost annually to freelance payment disputes  
- **80%** of freelancers face late payments  
- **Eliminate** 15-20% platform fees  
- **Global access** - No bank account needed  

## 🔗 Tech Stack
- **Clarity** - 8 secure smart contracts  
- **Stacks** - Bitcoin L2 security  
- **IPFS** - Decentralized file storage  
- **Clarinet** - Local development  

## 🎯 Why It Succeeds
✅ **Solves real pain** - Payment protection  
✅ **Network effect** - More users = better ratings  
✅ **Bitcoin security** - Unmatched trust  
✅ **Low fees** - Direct P2P  

**Ready to hire or get hired? Deploy GigChain today! 🚀**

---

**Deployed on:** Stacks Testnet  
**Live Demo:** Coming soon  
**Documentation:** `/docs/`  
**Contribute:** [GitHub](https://github.com/yourusername/gigchain)