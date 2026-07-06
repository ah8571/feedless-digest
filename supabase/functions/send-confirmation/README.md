# send-confirmation

Purpose: send the confirmation email after a `pending` signup is inserted.

## Expected input

```json
{
  "email": "reader@example.com",
  "confirmToken": "random-token"
}
```

## Expected environment variables

- `RESEND_API_KEY`
- `CONFIRM_BASE_URL`

## Expected behavior

1. Accept a POST request.
2. Build the confirmation URL as `${CONFIRM_BASE_URL}?token=...`.
3. Send the message through Resend.
4. Return a success or failure response to the caller.