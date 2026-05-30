import * as React from "react"
import { cn } from "@/utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-[#00E676] text-black hover:bg-[#00E676]/90 shadow-[0_0_20px_rgba(0,230,118,0.2)]",
      secondary: "bg-white text-black hover:bg-gray-100",
      outline: "border border-white/20 bg-transparent hover:bg-white/5 text-white",
      ghost: "bg-transparent hover:bg-white/5 text-white",
      danger: "bg-[#FF3D00] text-black hover:bg-[#FF3D00]/90",
    }
    
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
      xl: "px-10 py-5 text-lg",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
