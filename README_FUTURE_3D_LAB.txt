StepUp — Unit 3 3D Future Lab • Realistic Visual Upgrade
Date: 2026-10-02 (revision 3 — fixed)

Scope:
- Teacher Class Mode only.
- Shows only when Unit 3 is open/visible in Class Mode.
- Does NOT modify Student Journey, student progress, Firebase, reports, STEP Practice, or existing Class Mode practices.

Visual upgrade:
- Replaces primitive demo objects with one coherent modern living-room environment.
- Procedural wood floor, walls, rug, sofa, curtains, window, furniture, lamp, plant, TV and realistic proportions.
- Soft shadows, physically-based materials, ACES tone mapping and scene-specific lighting.
- Scene-specific camera composition with gentle look-around interaction.
- Clickable clue objects as well as the Reveal Clue button.
- Lightweight procedural assets: no large 3D model files are downloaded.

Lesson scenes:
1) Ringing smartphone -> decision now -> WILL
2) Packed suitcase + boarding pass -> plan before now -> BE GOING TO
3) Dark clouds + rain outside the window -> present evidence -> BE GOING TO
4) Match prediction with no result evidence -> opinion -> WILL
5) Final visual comparison

Interaction:
- True browser 3D rendered with Three.js.
- Drag gently to look around the room.
- Click relevant objects to inspect the clue.
- Choose WILL / BE GOING TO and show Form / Meaning / Function feedback.
- Designed for projector, iPad, and laptop Class Mode.

Performance:
- Three.js loads only after the teacher opens the lab.
- No AI/API usage.
- No external GLB/GLTF models; scene geometry and textures are generated locally in the browser.
- Pixel ratio is capped and geometry kept moderate for iPad/projector use.

Deployment:
Upload this ZIP to repository root using the exact name STEPUP_UPDATE.zip.
The existing StepUp workflow will overlay these files, remove the ZIP, commit the update, and deploy GitHub Pages.

Rollback:
Remove these two lines from index.html and delete the two files:
<link rel="stylesheet" href="future-lab-3d.css?v=20261002-3">
<script src="future-lab-3d.js?v=20261002-3"></script>

Revision 3 fixes:
- Three.js now loads as an ES module (three.module.min.js, r166) with a jsDelivr -> unpkg fallback.
  The previous build/three.min.js does not exist in three r160+, so the lab always failed to load.
- index.html rebuilt from the CURRENT repository version (includes Unit 3 content, review, celebrate,
  readsaver scripts) + only the two 3D lab lines. The old index.html would have removed them.
- A wrong answer no longer reveals the correct form in the FORM / MEANING / FUNCTION panel.
- Sky and lighting reset on every scene (going back from the rain scene no longer keeps a dark sky).
- WebGL context and room textures are fully released on exit (safe to open/close many times on iPad).
- Esc key closes the lab.
- Final comparison boards raised so the sofa no longer hides them.
