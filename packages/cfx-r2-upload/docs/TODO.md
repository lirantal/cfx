# TODO

## Region Information

**Status**: Pending  
**Priority**: Low

The `--region` CLI flag and region display in the UI is currently just a cosmetic display hint with a default value of "WNAM". It does not reflect actual data from Cloudflare R2.

### Current Behavior
- User can pass `-r` or `--region` flag with any value
- Defaults to "WNAM" (Western North America) if not provided
- Displayed in the LogMessages component

### Considerations
- Cloudflare R2 is location-agnostic and doesn't have traditional regions like AWS S3
- R2 automatically replicates data globally and serves from nearest edge
- Could potentially show the Cloudflare edge location being used for the upload
- Or remove the region display entirely since it's not meaningful for R2

### Options
1. Remove region display entirely
2. Keep as user-configurable display preference
3. Replace with actual Cloudflare edge/PoP information (if available from API)

