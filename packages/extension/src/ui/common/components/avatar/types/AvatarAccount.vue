<script setup lang="ts">
import { computed } from 'vue'
import createIcon from '@/providers/ethereum/libs/blockies'

// _Accounts (1874:473). Figma shows static patterns; in code it's an
// address-seeded blockie on an 8×8 grid. Networks draw their own identicons
// (Polkadot, Bitcoin, Solana… each differ), so pass that as `url` when you have
// it; the blockie is the fallback. The `connected` ring overhangs the box, so
// the parent (AppAvatar) draws it in its non-clipping outer layer — this child
// is just the (self-clipping) image that fills the box. The image is decorative
// (alt=""): the account's name/address is rendered as text by the consumer, and
// reading a 42-char hex string aloud helps no one.
const props = defineProps<{
  address?: string
  url?: string | null
}>()

defineOptions({ inheritAttrs: false })

// Only seed (and render) once we actually have an address; otherwise the
// template renders nothing and the parent AppAvatar's neutral fallback
// background shows through.
const src = computed(() => {
  if (props.url) return props.url
  return props.address ? createIcon(props.address, { size: 8, scale: 16 }) : ''
})
</script>

<template>
  <img v-if="src" :src="src" class="w-full h-full rounded-full" alt="" />
</template>
