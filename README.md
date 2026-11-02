# Amir M. Hamza | Portfolio

Static portfolio site (HTML, CSS, JavaScript). No build step.

## Files
- `index.html` : page content (overview, projects, resume, contact)
- `style.css` : all styling. Colors and fonts are at the top in `:root`
- `js/main.js` : scroll animations, sideways projects row, project viewer
- `js/projects.js` : project text and image lists (edit this to add or change projects)
- `img/` : your photo, project covers, and `img/gallery/` with all drawings

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000

## Publish on GitHub Pages
1. Create a repository and upload these files to the root.
2. Settings > Pages > Deploy from branch > `main` / root.
3. The site appears at `https://<username>.github.io/<repository>/`.

## Add images to a project
In `js/projects.js`, give the project a `groups` list:
`groups:[{name:"Group name",cats:[{name:"Category",imgs:["img/gallery/your-image.jpg"]}]}]`
Then add a cover image in `index.html` in place of the placeholder tile.
