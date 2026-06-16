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

    // FIXED: Conditional rendering based on hover prop
    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={cn('card', className)}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
          {...(props as any)} // FIXED: Cast to avoid motion props conflict
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('card', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card