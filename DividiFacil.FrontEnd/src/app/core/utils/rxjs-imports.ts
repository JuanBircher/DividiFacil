// 🚀 CENTRALIZAR IMPORTS DE RXJS PARA TREE SHAKING

// ✅ IMPORTS ESPECÍFICOS (Tree Shaking Friendly)
export { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
export { 
  map, 
  filter, 
  catchError, 
  takeUntil, 
  debounceTime,
  distinctUntilChanged,
  switchMap,
  mergeMap,
  concatMap,
  tap,
  finalize,
  retry,
  shareReplay,
  startWith
} from 'rxjs/operators';

export { forkJoin, combineLatest, merge, of, throwError, timer } from 'rxjs';