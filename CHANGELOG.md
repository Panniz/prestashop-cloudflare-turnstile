# Changelog

## 1.2.0

- Load the Cloudflare script only when the visitor starts using a protected form (focus, click or touch), instead of on every page. A submit sent before the token is ready waits for it and is then sent again.
- Newsletter widget uses `appearance: interaction-only`, so it stays invisible unless Cloudflare asks the visitor to click.
- Widget option `appearance` (`always`, `execute`, `interaction-only`).

## 1.1.4

- Add newsletter registration form ([@jf-viguier](https://github.com/jf-viguier))

## 1.1.3

- Fixed widget not showing on third party form

## 1.1.2

- Fix current theme directory retrieval ([@jf-viguier](https://github.com/jf-viguier))

## 1.1.1

- Fix renew password form turnstile error

## 1.1.0

- Prestashop 8.0.0 compatibility

## 1.0.3

- Custom or third party form validation

## 1.0.2

- Action option added

## 1.0.1

- Display full error messages instead of error codes
- PHPDoc updated

## 1.0.0

- First stable release