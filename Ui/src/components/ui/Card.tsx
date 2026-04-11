import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, ...props }, ref) => {
    const Component = hover ? motion.div : 'div'
    const motionProps = hover ? {
      whileHover: { scale: 1.02, y: -2 },
      transition: { duration: 0.2 }
    } : {}

    return (
      <Component
        ref={ref}
        className={cn('card', className)}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

export default Card