import { toast } from '@zerodevx/svelte-toast';

export const success = m => toast.push(m, {
    theme: {
        '--toastBackground': 'mintcream',
        '--toastColor': 'rgba(72,187,120,0.9)',
        '--toastBarBackground': '#2F855A'
    }
});

export const warn = m => toast.push(m, {
    theme: {
        '--toastBackground': 'orange',
        '--toastColor': 'white',
        '--toastBarBackground': 'olive'
    } });

export const error = m => toast.push(m, {
    theme: {
        '--toastBackground': 'rgba(239, 68, 68, 0.9)',
        '--toastColor': 'white',
        '--toastBarBackground': '#fecaca',
    } });