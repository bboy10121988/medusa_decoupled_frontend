const rawMode = (process.env.NEXT_PUBLIC_ENV_MODE || process.env.ENV_MODE || (process.env.NODE_ENV === 'development' ? 'local' : 'vm')).toLowerCase()

export type EnvironmentMode = 'local' | 'vm'

export const ENV_MODE: EnvironmentMode = rawMode === 'vm' ? 'vm' : 'local'

export const isVmMode = ENV_MODE === 'vm'
