'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

interface IProps {
    children: React.ReactNode
    delay: number
    isFullWidth?: boolean
    isMotionDisabled?: boolean
}

const InputMotion = ({
    children,
    delay,
    isFullWidth = false,
    isMotionDisabled = false,
}: IProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const className = isFullWidth ? 'w-full' : 'w-auto'

    if (isMotionDisabled) {
        return <div className={className}>{children}</div>
    }

    const handleAnimationComplete = () => {
        if (ref.current) {
            ref.current.style.transform = ''
        }
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                delay,
                ease: 'easeOut',
            }}
            onAnimationComplete={handleAnimationComplete}
        >
            {children}
        </motion.div>
    )
}

export default InputMotion