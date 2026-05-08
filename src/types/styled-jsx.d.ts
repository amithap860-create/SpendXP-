/**
 * Extend JSX intrinsic element types so that <style jsx> and
 * <style jsx global> compile without TS2322 errors.
 * Next.js includes styled-jsx internally; we just need the type augmentation.
 */
import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
