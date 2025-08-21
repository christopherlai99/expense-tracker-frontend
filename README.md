# ExpenseTrackerFe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Setup instructions
```bash
npm install
ng serve
```

## Design & architecture overview
- **Frontend Framework**: Angular 17 (chosen for strong TypeScript support and structure).
- **UI**: Angular Material + TailwindCSS for consistent design.
- **State Management**: Local component state (simple enough for this project).
- **Architecture**: 
  - Service layer (`ExpenseService`) handles API interaction.
  - Components (`MultiSelectDropdown`, `ViewExpenses`) focus on UI and data binding.
  - Models (`Expense`, `ExpenseFilter`) define consistent data structures.

## Trade-offs made
- **Angular vs Vue**: Angular was chosen for its strong TypeScript integration and opinionated structure. The trade-off is a steeper learning curve and slightly heavier setup compared to Vue’s lighter footprint.
- **No global state (e.g., NgRx)**: For a small app, avoided extra complexity. The trade-off is less scalability if the app grows.
- **UI Library**: Angular Material used for speed, but it increases bundle size.
- **API Integration**: Mock/local API used during development instead of a hosted backend for speed.

## Areas for improvement and next steps for refactoring
- **Error Handling**: Centralize error handling in an interceptor instead of repeating in every `subscribe`.
- **Code Reusability**: Extract repeated modal/dialog logic into shared components.

## features were skipped due to time
- **Table Column Customization**: Currently columns are fixed. Would add a customizable column selector to improve user experience.
- **Type of Charts**: More kind of charts which can help user analyse the income expense condition (e.g., monthly breakdown, category distribution)

## Use of AI-assisted Tools
- **ChatGPT**: Speed up chart setup, and refine string/date sorting logic.
- **Claude**: Debug multi-select-dropdown component.
- **Manual Adjustments**: AI-generated code was reviewed, refactored, and adapted to meet the project’s requirements.