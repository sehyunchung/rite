import { ThemeProvider } from 'next-themes'
import { TamaguiDemoClient } from './tamagui-demo-client'

export default function TamaguiDemoPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="font-sans min-h-screen">
        <TamaguiDemoClient />
      </div>
    </ThemeProvider>
  )
}