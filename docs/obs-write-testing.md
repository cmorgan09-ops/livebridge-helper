# OBS Write Testing

## Purpose
This test confirms that the helper can safely write stream service settings into OBS using dummy values.

## Test Values
- Server: `rtmps://example.com/live`
- Key: `test-stream-key-123`

## Expected Result
After running the write test, OBS should report:
- server is set
- stream key exists

## Important
Do not use production stream values during this test.
