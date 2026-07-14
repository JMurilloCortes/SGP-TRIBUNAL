import Swal from 'sweetalert2'

const base = Swal.mixin({
  customClass: {
    popup: 'sw-popup',
    title: 'sw-title',
    htmlContainer: 'sw-html',
    confirmButton: 'sw-btn',
    cancelButton: 'sw-btn sw-btn-outline',
    icon: 'sw-icon',
    timerProgressBar: 'sw-progress',
    closeButton: 'sw-close',
  },
  buttonsStyling: false,
  reverseButtons: true,
  showClass: { popup: 'sw-in' },
  hideClass: { popup: 'sw-out' },
  backdrop: 'rgba(45,43,61,0.25)',
})

type ToastType = 'success' | 'error' | 'warning' | 'info'

const toastTheme: Record<ToastType, { bg: string; icon: string; shadow: string; iconBg: string }> = {
  success: { bg: '#8BC4A8', icon: '#FFFFFF', shadow: 'rgba(139,196,168,0.35)', iconBg: 'rgba(139,196,168,0.12)' },
  error: { bg: '#E8A8B0', icon: '#FFFFFF', shadow: 'rgba(232,168,176,0.35)', iconBg: 'rgba(232,168,176,0.12)' },
  warning: { bg: '#E8CF96', icon: '#3D351B', shadow: 'rgba(232,207,150,0.35)', iconBg: 'rgba(232,207,150,0.12)' },
  info: { bg: '#A8C8E8', icon: '#1B2B3D', shadow: 'rgba(168,200,232,0.35)', iconBg: 'rgba(168,200,232,0.12)' },
}

export async function confirmDelete(title: string) {
  const r = await base.fire({
    title,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    reverseButtons: false,
    customClass: { confirmButton: 'sw-btn sw-btn-danger' },
    didOpen: () => {
      document.addEventListener('keydown', handleEnterAsConfirm)
    },
    willClose: () => {
      document.removeEventListener('keydown', handleEnterAsConfirm)
    },
  })
  return r.isConfirmed
}

export async function confirmAction(title: string, text?: string) {
  const r = await base.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    reverseButtons: false,
    customClass: { confirmButton: 'sw-btn sw-btn-primary' },
    didOpen: () => {
      document.addEventListener('keydown', handleEnterAsConfirm)
    },
    willClose: () => {
      document.removeEventListener('keydown', handleEnterAsConfirm)
    },
  })
  return r.isConfirmed
}

export async function alertSuccess(title: string, text?: string) {
  await base.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Entendido',
    customClass: { confirmButton: 'sw-btn sw-btn-primary' },
  })
}

export async function alertError(title: string, text?: string) {
  await base.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Cerrar',
    customClass: { confirmButton: 'sw-btn sw-btn-primary' },
  })
}

export async function alertWarning(title: string, text?: string) {
  await base.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'Entendido',
    customClass: { confirmButton: 'sw-btn sw-btn-primary' },
  })
}

export async function alertInfo(title: string, text?: string) {
  await base.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'Entendido',
    customClass: { confirmButton: 'sw-btn sw-btn-primary' },
  })
}

export async function showLoading(title: string, text?: string) {
  const instance = base.fire({
    title,
    text,
    icon: 'info',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCancelButton: false,
    didOpen: (el) => {
      const html = el.querySelector('.swal2-html-container') as HTMLElement
      if (html) {
        const spinner = document.createElement('div')
        spinner.style.cssText = `
          width: 40px; height: 40px; margin: 12px auto 0;
          border: 3.5px solid rgba(155,142,216,0.12);
          border-top-color: #9B8ED8;
          border-radius: 50%;
          animation: swSpin 0.8s linear infinite;
        `
        html.parentElement?.insertBefore(spinner, html.nextSibling)
      }
    },
    willClose: (el) => {
      const spinner = el.querySelector('div[style*="border-top-color"]')
      spinner?.remove()
    },
  })
  return instance
}

export async function closeLoading() {
  Swal.close()
}

export async function toast(type: ToastType, message: string) {
  const t = toastTheme[type]
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  }
  base.fire({
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: type === 'error' ? 5000 : 3500,
    timerProgressBar: true,
    icon: type,
    backdrop: false,
    customClass: { popup: `sw-toast swal2-icon-${type}` },
    didOpen: (el) => {
      el.style.marginTop = 'env(safe-area-inset-top, 0px)'
      el.style.marginTop = 'calc(env(safe-area-inset-top, 0px) + 64px)'
      const bar = el.querySelector('.swal2-timer-progress-bar') as HTMLElement
      if (bar) {
        bar.style.background = `linear-gradient(90deg, ${t.bg}, ${t.icon})`
      }
      const iconEl = el.querySelector('.swal2-icon') as HTMLElement
      if (iconEl) {
        iconEl.style.cssText = `
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          width: 30px !important;
          height: 30px !important;
          border: none !important;
          border-radius: 50%;
          background: ${t.iconBg};
          color: ${t.bg};
          font-size: 17px;
          font-weight: 700;
          box-shadow: 0 0 0 4px ${t.iconBg.replace('0.12', '0.06')};
          margin: 0 !important;
          flex-shrink: 0;
          animation: swToastIconBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `
        iconEl.textContent = icons[type]
      }
      const titleEl = el.querySelector('.swal2-title') as HTMLElement
      if (titleEl) {
        titleEl.style.cssText = `
          font-size: 0.9rem;
          font-weight: 600;
          color: #2D2B3D;
          padding: 0;
          margin: 0;
        `
      }
    },
  })
}

export async function toastSuccess(message: string) { return toast('success', message) }
export async function toastError(message: string) { return toast('error', message) }
export async function toastWarning(message: string) { return toast('warning', message) }
export async function toastInfo(message: string) { return toast('info', message) }

function handleEnterAsConfirm(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement
    if (confirmBtn) {
      e.preventDefault()
      confirmBtn.click()
    }
  }
}