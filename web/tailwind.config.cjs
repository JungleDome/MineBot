const colorSaveList = [];

for (const key of ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']) {

  colorSaveList.push(`text-${key}-200`);
  colorSaveList.push(`text-${key}-500`);
  colorSaveList.push(`bg-${key}-200`);
  colorSaveList.push(`bg-${key}-500`);
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  important: true,
  safelist: colorSaveList
};
