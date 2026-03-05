import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useState, useEffect } from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [active, setActive] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const toasts = document.querySelectorAll('[data-sonner-toast]')
      let isVisible = false
      toasts.forEach(t => {
        if (t.getAttribute('data-removed') !== 'true') {
          isVisible = true
        }
      })
      setActive(isVisible)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-removed']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {active && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] transition-opacity" />
      )}
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast: "rounded-xl border shadow-lg backdrop-blur-md bg-white/80 z-[1000]",
            success: "!bg-[#22c55e] !text-white !border-[#1ea34d]",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        icons={{
          success: <CircleCheckIcon className="size-5 text-white" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
          } as React.CSSProperties
        }
        {...props}
      />
    </>
  )
}

export { Toaster }
