import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';
  @Input() placeholder: string = '/assets/images/placeholder.svg';
  @Input() errorImage: string = '/assets/images/error-placeholder.svg';

  private observer?: IntersectionObserver;
  private isLoaded = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupImage();
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupImage(): void {
    // Configurar imagen inicial
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholder);
    this.renderer.addClass(this.el.nativeElement, 'lazy-loading');
    
    // Configurar loading="lazy" nativo del navegador como fallback
    this.renderer.setAttribute(this.el.nativeElement, 'loading', 'lazy');
  }

  private createObserver(): void {
    // Verificar soporte de IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      this.loadImage();
      return;
    }

    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoaded) {
          this.loadImage();
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    if (this.isLoaded || !this.appLazyLoad) return;

    this.isLoaded = true;
    const img = new Image();
    
    // Evento de carga exitosa
    img.onload = () => {
      requestAnimationFrame(() => {
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyLoad);
        this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
        this.renderer.addClass(this.el.nativeElement, 'lazy-loaded');
      });
    };
    
    // Evento de error
    img.onerror = () => {
      requestAnimationFrame(() => {
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.errorImage);
        this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
        this.renderer.addClass(this.el.nativeElement, 'lazy-error');
      });
    };

    img.src = this.appLazyLoad;
  }
}