export function srcToSrcSet(src: string, minWidth = 100, maxWidth = 1920, step = 100) {
    return Array.from({ length: (maxWidth - minWidth) / step + 1 })
        .map((_, i) => `${src}?width=${minWidth + i * step} ${minWidth + i * step}w`)
        .join(", ");
}