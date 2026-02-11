# Contributing to Wajira Dashboard

Terima kasih sudah tertarik untuk contribute! 🎉

## 🔧 Development Setup

1. Fork repository ini
2. Clone fork kamu:
   ```bash
   git clone https://github.com/your-username/wajira-dashboard.git
   cd wajira-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Run development server:
   ```bash
   npm run dev
   ```

## 📝 Contribution Guidelines

### Branch Naming

- `feature/nama-fitur` - Untuk fitur baru
- `bugfix/nama-bug` - Untuk bug fixes
- `hotfix/nama-hotfix` - Untuk urgent fixes
- `docs/topik` - Untuk dokumentasi

### Commit Messages

Gunakan **Conventional Commits**:

```
feat: add export to Excel feature
fix: resolve sidebar navigation issue
docs: update API documentation
style: format code with prettier
refactor: optimize table rendering performance
test: add unit tests for auth service
chore: update dependencies
```

### Pull Request Process

1. ✅ Create branch dari `develop`
2. ✅ Write clear, concise commit messages
3. ✅ Update documentation if needed
4. ✅ Test your changes thoroughly
5. ✅ Create PR to `develop` branch
6. ✅ Wait for code review

### Code Style

- Follow existing code patterns
- Use TypeScript (no `any` types!)
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful variable names

### Testing

Before submitting PR, pastikan:
- [ ] Code builds successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Mobile responsive
- [ ] Tested in Chrome & Safari

## 🐛 Bug Reports

Gunakan GitHub Issues dengan template:
- Describe the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Environment (browser, OS)

## 💡 Feature Requests

Open GitHub Issue dengan label `enhancement`:
- Clear description
- Use case / business value
- Proposed solution (optional)

## ❓ Questions?

Contact via:
- GitHub Issues
- Slack: #wajira-dashboard
- Email: dev@wajira.com

Matur nuwun! 🙏
