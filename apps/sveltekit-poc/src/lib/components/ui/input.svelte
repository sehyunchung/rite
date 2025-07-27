<script lang="ts">
  import { cn } from "$lib/utils";

  export let type = "text";
  export let value = "";
  export let placeholder = "";
  export let disabled = false;
  export let class_ = "";

  $: classes = cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    class_
  );
</script>

<input
  {type}
  bind:value
  {placeholder}
  {disabled}
  class={classes}
  {...$$restProps}
  on:input
  on:change
  on:blur
  on:focus
/>