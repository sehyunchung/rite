<script lang="ts">
  import { cn } from "$lib/utils";

  export let class_ = "";
</script>

<div class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", class_)} {...$$restProps}>
  <slot />
</div>