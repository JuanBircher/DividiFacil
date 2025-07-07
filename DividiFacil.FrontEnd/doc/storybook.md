# Storybook para DividiFácil

Storybook permite documentar, visualizar y testear componentes de forma aislada.

## Uso básico
- Ejecuta Storybook: `npm run storybook`
- Accede a la UI: http://localhost:6006

## Buenas prácticas
- Crea un archivo `.stories.ts` por cada componente en `src/app/shared/components/`
- Documenta variantes, slots y estados.
- Usa controles para inputs y outputs.

## Ejemplo mínimo para `app-card`
```ts
import { Meta, Story } from '@storybook/angular';
import { CardComponent } from './card.component';

export default {
  title: 'Shared/Card',
  component: CardComponent,
  tags: ['autodocs'],
} as Meta<CardComponent>;

const Template: Story<CardComponent> = (args: CardComponent) => ({
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  title: 'Tarjeta de ejemplo',
  subtitle: 'Subtítulo',
  icon: 'group',
  value: 1234,
  loading: false,
  clickable: true,
};
```

---
