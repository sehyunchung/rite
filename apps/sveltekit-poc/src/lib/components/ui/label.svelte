<script lang="ts">
  import { cn } from "$lib/utils";

  export let class_ = "";

  $: classes = cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    class_
  );
</script>

<label class={classes} {...$$restProps} on:click>
  <slot />
</label>