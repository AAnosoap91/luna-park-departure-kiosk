# Luna Park Departure Machine

A local, single-page touchscreen prototype for testing a post-event departure flow. It simulates card insertion, travel comparison, souvenir stamp selection, card stamping, personalised QR generation, card return and reset.

No printer, stamp machine, transport API, payment system or database is connected.

## Run the prototype (Python)

No third-party Python packages are required.

From this project folder, run:

```bash
python3 app.py
```

The Python program starts the local server and opens [http://127.0.0.1:8000](http://127.0.0.1:8000) in the default browser.

Stop the server with `Ctrl+C`.

To start the server without automatically opening a browser:

```bash
python3 app.py --no-browser
```

To choose another port:

```bash
python3 app.py --port 8080
```

You can also open `index.html` directly in a modern browser if preferred.

## Edit the transport information

All option names, walking times, waiting times, crowd levels, descriptions, stamp colours and stamp copy are grouped at the top of:

```text
app.js
```

Edit the `TRANSPORT_OPTIONS` object and refresh the browser.

## Prototype flow

1. Insert Card
2. Compare Metro, Bus, Taxi and Park
3. Select an option and review its details
4. Preview and confirm the matching souvenir stamp
5. Watch the simulated stamping and QR generation process
6. View the personalised QR code
7. Finish, take the card and start again

The QR is generated entirely in the browser and opens the separate Luna Park Departure Pass mobile website with the selected option in its URL.

## Configure the mobile website URL

After deploying the mobile website, edit this single value near the top of `app.js`:

```js
const MOBILE_SITE_URL = "https://aanosoap91.github.io/luna-park-departure-pass/";
```

The kiosk automatically adds `?option=metro`, `?option=bus`, `?option=taxi` or `?option=stay` to that address.

## Deploy this kiosk to GitHub Pages

1. Create a public GitHub repository named `luna-park-departure-kiosk`.
2. Add `index.html`, `styles.css`, `app.js`, `app.py`, `.nojekyll` and this README to the repository root.
3. Open **Settings → Pages** in GitHub.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. The public kiosk URL will be `https://aanosoap91.github.io/luna-park-departure-kiosk/`.

## Test the complete two-site flow

1. Deploy the mobile Departure Pass website first.
2. Put its public URL in `MOBILE_SITE_URL` at the top of `app.js`.
3. Deploy or update this kiosk website.
4. Complete a kiosk selection and confirm the stamp.
5. Scan the displayed QR code with a phone.
6. Confirm the mobile site opens with the matching `?option=` value.

## Notes for user testing

- The interface uses large touch targets and high-contrast selected states.
- Buttons and option cards are keyboard accessible.
- Motion is reduced when the device has “Reduce motion” enabled.
- The layout adapts to kiosk, tablet and mobile screen sizes.
- All data is illustrative and intentionally labelled as prototype information.
