# Dependency Upgrades Documentation

## Security Upgrade - June 2024

### Upgraded Packages

| Package | Previous Version | New Version | Notes |
|---------|-----------------|------------|-------|
| Vite    | 4.5.6           | 5.2.2      | Major version upgrade with potential breaking changes |
| Axios   | 1.7.4           | 1.7.6      | Minor security patch |
| PostCSS | 8.4.x           | 8.4.35     | Minor security patch |

### Configuration Updates

- **vite.config.ts**: Verified compatibility with Vite 5
- **postcss.config.js**: Verified configuration format compatibility
- **src/api/instance.ts**: Confirmed Axios instance configuration compatibility

### Build System Updates

- Added `update-deps` script to package.json
- Created Dependabot configuration for automated security updates
- Updated GitHub workflow to use Node 20

### Testing Performed

- Built application successfully
- Verified no TypeScript errors
- Tested key application flows
  - Proposal creation and management
  - Authentication
  - API interactions

### Known Issues

None identified. Please report any issues discovered in production to the frontend team.

### Rollback Procedure

If issues are encountered:

1. Revert package changes:
   ```bash
   git checkout package.json yarn.lock
   yarn install
   ```

2. Document any issues encountered for future reference

### Future Recommendations

- Consider upgrading TypeScript (currently on 5.0.4)
- Monitor Vite and React compatibility with future updates
- Continue regular dependency audits
