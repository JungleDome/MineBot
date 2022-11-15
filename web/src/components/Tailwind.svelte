<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  .capitalize-sentence {
    @apply inline-block;
    text-transform: lowercase;
  }

  .capitalize-sentence::first-letter {
    text-transform: uppercase;
  }
</style>
