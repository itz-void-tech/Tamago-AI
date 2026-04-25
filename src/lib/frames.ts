// ============================================================
// ASCII Animation Frames — Multiple Pet Types
// Clean, smooth, high-quality ASCII art
// ============================================================

export type PetType = 'cat' | 'dog' | 'bunny' | 'fox' | 'panda';

export const PET_INFO: Record<PetType, { name: string; emoji: string; desc: string }> = {
  cat:   { name: 'Cat',   emoji: '🐱', desc: 'Sassy, independent, loves naps' },
  dog:   { name: 'Dog',   emoji: '🐶', desc: 'Loyal, energetic, loves treats' },
  bunny: { name: 'Bunny', emoji: '🐰', desc: 'Shy, gentle, loves carrots' },
  fox:   { name: 'Fox',   emoji: '🦊', desc: 'Clever, mischievous, curious' },
  panda: { name: 'Panda', emoji: '🐼', desc: 'Chill, hungry, loves hugs' },
};

// ─── EYE STATES for cursor tracking ───
// {{LEYE}} and {{REYE}} are replaced based on cursor position
// Possible: o  -  ^  >  <  O  @  x  T

const FRAMES: Record<PetType, Record<string, string[]>> = {
  // ═══════════════════════════════════════════════
  // CAT
  // ═══════════════════════════════════════════════
  cat: {
    idle: [
`     /\\_/\\  
    ( {{LEYE}}.{{REYE}} ) 
     > ^ <  `,
`     /\\_/\\  
    ( -.- ) 
     > ^ <  `,
`     /\\_/\\  
    ( {{LEYE}}.{{REYE}} )
      > ^   `,
`     /\\_/\\  
    ( -.- ) 
     > ^ <  `,
`     /\\_/\\  
    ( {{LEYE}}.{{REYE}} ) 
     > ^ <  `,
`     /\\_/\\  
    ( -.- ) 
     > ^ <  `,
    ],
    eating: [
`    /\\_/\\  
   ( {{LEYE}}.{{REYE}} ) 
   (>^{{FOOD}}<)  `,
`    /\\_/\\  
   ( >.< ) 
   (>^{{FOOD}}<) nom`,
`    /\\_/\\  
   ( {{LEYE}}.{{REYE}} ) 
   (>^{{FOOD}}<) chew`,
`    /\\_/\\  
   ( -.- ) 
   (>^{{FOOD}}<) mmm`,
`   🎉/\\_/\\🎉  
  ( ^.^ ) 
  (>^❤️<) YUM!`,
`   🎉/\\_/\\🎉  
  ( -.- ) 
  (>^❤️<) `,
    ],
    playing: [
`   /\\_/\\  
  ( {{LEYE}}.{{REYE}} ) 
   >{{TOY}}<  `,
`      /\\_/\\  
     ( {{LEYE}}.{{REYE}} ) 
      >{{TOY}}<  `,
`         /\\_/\\  
        ( {{LEYE}}.{{REYE}} ) 
         >{{TOY}}<  `,
`            /\\_/\\  
           ( {{LEYE}}.{{REYE}} ) 
            >{{TOY}}<  `,
`         /\\_/\\  
        ( {{LEYE}}.{{REYE}} ) 
         >{{TOY}}<  `,
`      /\\_/\\  
     ( {{LEYE}}.{{REYE}} ) 
      >{{TOY}}<  `,
    ],
    bath: [
`     /\\_/\\  
    ( {{LEYE}}.{{REYE}} ) 
    > ^ <  o
     \\___/ oo`,
`     /\\_/\\  
    ( -.- ) 
    > ^ < o
     \\___/oo `,
`     /\\_/\\  
    ( {{LEYE}}.{{REYE}} ) 
     > ^ <o 
     \\___/ oo`,
`     /\\_/\\  
    ( -.- ) 
     > ^ <o
     \\___/oo `,
    ],
    sick: [
`     /\\_/\\  
    ( {{LEYE}}.{{REYE}} ) 
     > ^ <  
   💉`,
`     /\\_/\\  
    ( -.- ) 
     >   <  
   💉`,
`     /\\_/\\  
    ( T.T ) 
     > ^ <  
   💉`,
`     /\\_/\\  
    ( -.- ) 
     >   <  
   💉`,
    ],
    discipline: [
`     /\\_/\\  
    ( o.o )?
     > ^ <  
    {{ICON}}`,
`     /\\_/\\  
    ( >.< )!
     > ~ <  
    {{ICON}}`,
`     /\\_/\\  
    ( T.T )
     > ^ <  
    {{ICON}}`,
`     /\\_/\\  
    ( -.- )
     >   <  
    {{ICON}}`,
    ],
    angry: [
`     /\\_/\\  💢
    ( >.< ) 
     > m <  `,
`     /\\_/\\  
    ( >O< ) 💢
     > w <  `,
    ],
    sleeping: [
`     /\\_/\\     z
    ( -.- )   z
     > ^ <  `,
`     /\\_/\\    z
    ( -.- )  z
     > ^ <  z`,
`     /\\_/\\   z
    ( -.- ) z
     > ^ <  zz`,
`     /\\_/\\  z
    ( -.- )z
     > ^ <  zzz`,
    ],
    happy: [
`  * /\\_/\\ *
   ( ^.^ )
  * > ^ < *`,
`   /\\_/\\
   ( ^.^ )
  * > ^ < *`,
    ],
    vomit: [
`   /\\_/\\
  ( o.o )
  (>    <)
   bleh`,
    ],
    full: [
`   /\\_/\\
  ( o.o )
   > - <
   full!`,
    ],
  },
  // ═══════════════════════════════════════════════
  // DOG
  // ═══════════════════════════════════════════════
  dog: {
    idle: [
`  |\\_/|
  ( {{LEYE}} {{REYE}} )
  / > <\\`,
`  |\\_/|
  ( - - )
  / > <\\`,
    ],
    eating: [
`  |\\_/|  {{FOOD}}
  ( {{LEYE}} {{REYE}} )/
  / > <\\`,
    ],
    playing: [
`  |\\_/|  {{TOY}}
  ( {{LEYE}} {{REYE}} )/
  / > <\\`,
    ],
    bath: [
`  |\\_/| ~
  ( o o ) ~ ~
  / > <\\
  ~~~~~`,
    ],
    sick: [
`  |\\_/|
  ( x x )
  / ~ <\\
   +`,
    ],
    discipline: [
`  |\\_/| {{ICON}}
  ( o o )!
  / > <\\`,
    ],
    angry: [
`  |\\_/| 💢
  ( >.< )
  / m <\\`,
`  |\\_/|
  ( >O< ) 💢
  / w <\\`,
    ],
    sleeping: [
`  |\\_/|   z
  (-.-)  z
  / > <\\`,
`  |\\_/|  z
  (-.-) z
  / > <\\ z`,
    ],
    happy: [
` *|\\_/|*
  (^.^)
  / > <\\ ~~`,
`  |\\_/|
  (^.^) ~~
 */ > <\\*`,
    ],
    vomit: [
`  |\\_/|
  (o.o)
  /> <\\`,
    ],
    full: [
`  |\\_/|
  (o.o)
  / - <\\
  full!`,
    ],
  },
  // ═══════════════════════════════════════════════
  // BUNNY
  // ═══════════════════════════════════════════════
  bunny: {
    idle: [
`  (\\ /)
  ({{LEYE}}.{{REYE}})
  (")(")`,
`  (\\ /)
  (-.- )
  (")(")`,
    ],
    eating: [
`  (\\ /) {{FOOD}}
  ({{LEYE}}.{{REYE}})/
  (")(")`,
    ],
    playing: [
`  (\\ /)  {{TOY}}
 ({{LEYE}}.{{REYE}})/
 (")(")`,
    ],
    bath: [
`  (\\ /)  ~
 ( o o )~ ~
 (") (") o
 ~~~~~~~~`,
    ],
    sick: [
`  (\\ /)
 ( x x )
 (") (")
    +`,
    ],
    discipline: [
`  (\\ /) {{ICON}}
 ( o o )!
 (") (")`,
    ],
    angry: [
`  (\\ /) 💢
 ( >.< )
 (") (")`,
`  (\\ /)
 ( >O< ) 💢
 (") (")`,
    ],
    sleeping: [
`  (\\ /)  z
 ( -.- )z
 (") (")`,
`  (\\ /) z
 ( -.- ) z
 (") (")z`,
    ],
    happy: [
` *(\\ /)*
  (^.^)
 *(")(")*`,
    ],
    vomit: [
`  (\\ /)
 ( o o )
 (") (")
  bleh`,
    ],
    full: [
`  (\\ /)
 ( o o )
 (") (")
 full!`,
    ],
  },
  // ═══════════════════════════════════════════════
  // FOX
  // ═══════════════════════════════════════════════
  fox: {
    idle: [
`  /\\   /\\
 //\\\\_//\\\\
  ( {{LEYE}}.{{REYE}} )
   > ^ <`,
`  /\\   /\\
 //\\\\_//\\\\
  ( -.- )
   > ^ <`,
    ],
    eating: [
`  /\\   /\\  {{FOOD}}
 //\\\\_//\\\\/
  ( {{LEYE}}.{{REYE}} )
   > ^ <`,
    ],
    playing: [
`  /\\   /\\  {{TOY}}
 //\\\\_//\\\\/
  ( {{LEYE}}.{{REYE}} )
   > ^ <`,
    ],
    bath: [
`  /\\   /\\  ~
 //\\\\_//\\\\ ~ ~
  ( o o )  o
  ~~~~~~~`,
    ],
    sick: [
`  /\\   /\\
 //\\\\_//\\\\
  ( x x )
   > ^ <
    +`,
    ],
    discipline: [
`  /\\   /\\ {{ICON}}
 //\\\\_//\\\\!
  ( o o )
   > ^ <`,
    ],
    angry: [
`  /\\   /\\ 💢
 //\\\\_//\\\\
  ( >.< )
   > m <`,
`  /\\   /\\
 //\\\\_//\\\\ 💢
  ( >O< )
   > w <`,
    ],
    sleeping: [
`  /\\   /\\   z
 //\\\\_//\\\\ z
  ( -.- )
   > ^ <`,
`  /\\   /\\  z
 //\\\\_//\\\\z
  ( -.- ) z
   > ^ <`,
    ],
    happy: [
` */\\   /\\*
 //\\\\_//\\\\
  ( ^.^ )
   > ^ <`,
    ],
    vomit: [
`  /\\   /\\
 //\\\\_//\\\\
  ( o o )
   > ^ <
   bleh`,
    ],
    full: [
`  /\\   /\\
 //\\\\_//\\\\
  ( o o )
   > - <
   full!`,
    ],
  },
  // ═══════════════════════════════════════════════
  // PANDA
  // ═══════════════════════════════════════════════
  panda: {
    idle: [
`  _   _
 (o)_(o)
  ( {{LEYE}}.{{REYE}} )
   > - <`,
`  _   _
 (o)_(o)
  ( -.- )
   > - <`,
    ],
    eating: [
`  _   _  {{FOOD}}
 (o)_(o) /
  ( {{LEYE}}.{{REYE}} )
   > - <`,
    ],
    playing: [
`  _   _  {{TOY}}
 (o)_(o) /
  ( {{LEYE}}.{{REYE}} )
   > - <`,
    ],
    bath: [
`  _   _   ~
 (o)_(o) ~ ~
  ( o o ) o
  ~~~~~~~`,
    ],
    sick: [
`  _   _
 (o)_(o)
  ( x x )
   > - <
    +`,
    ],
    discipline: [
`  _   _  {{ICON}}
 (o)_(o)!
  ( o o )
   > - <`,
    ],
    angry: [
`  _   _  💢
 (o)_(o)
  ( >.< )
   > m <`,
`  _   _
 (o)_(o) 💢
  ( >O< )
   > w <`,
    ],
    sleeping: [
`  _   _    z
 (o)_(o)  z
  ( -.- )
   > - <`,
`  _   _   z
 (o)_(o) z
  ( -.- ) z
   > - <`,
    ],
    happy: [
` * _   _ *
 (o)_(o)
  ( ^.^ )
   > - <`,
    ],
    vomit: [
`  _   _
 (o)_(o)
  ( o o )
   > - <
   bleh`,
    ],
    full: [
`  _   _
 (o)_(o)
  ( o o )
   > - <
   full!`,
    ],
  },
};

export function getFrames(pet: PetType, state: string): string[] {
  return FRAMES[pet]?.[state] || FRAMES[pet]?.idle || FRAMES.cat.idle;
}

export type EyeDirection = 'center' | 'left' | 'right' | 'up' | 'down';

const EYE_CHARS: Record<EyeDirection, { left: string; right: string }> = {
  center: { left: 'o', right: 'o' },
  left:   { left: '<', right: '<' },
  right:  { left: '>', right: '>' },
  up:     { left: '^', right: '^' },
  down:   { left: 'v', right: 'v' },
};

export function applyEyes(frame: string, direction: EyeDirection): string {
  const eyes = EYE_CHARS[direction];
  return frame.replace('{{LEYE}}', eyes.left).replace('{{REYE}}', eyes.right);
}

export function applyPlaceholders(frame: string, replacements: Record<string, string>): string {
  let result = frame;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  result = result.replaceAll('{{LEYE}}', 'o').replaceAll('{{REYE}}', 'o');
  result = result.replaceAll('{{FOOD}}', '').replaceAll('{{TOY}}', '').replaceAll('{{ICON}}', '');
  return result;
}
