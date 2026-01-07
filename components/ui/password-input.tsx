'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

export type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  toggleLabel?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ toggleLabel = 'Show password', ...props }, ref) {
    const [visible, setVisible] = React.useState(false)
    return (
      <InputGroup>
        <InputGroupInput ref={ref} type={visible ? 'text' : 'password'} {...props} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={toggleLabel}
            title={toggleLabel}
            onClick={() => setVisible((v) => !v)}
            type="button"
          >
            {visible ? <EyeOff className="opacity-80" /> : <Eye className="opacity-80" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
  },
)
