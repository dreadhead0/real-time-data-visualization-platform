<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-vue-next";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();

function iconFor(type: string) {
  if (type === "success") return CheckCircle2;
  if (type === "error") return XCircle;
  if (type === "warning") return AlertTriangle;
  return Info;
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-host">
      <TransitionGroup name="toast">
        <div
          v-for="item in toast.toasts"
          :key="item.id"
          class="toast-card"
          :class="`toast-${item.type}`"
        >
          <component :is="iconFor(item.type)" :size="18" />

          <span>{{ item.message }}</span>

          <button type="button" @click="toast.remove(item.id)">
            <X :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
