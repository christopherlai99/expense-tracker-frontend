import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-select-dropdown.html',
  styleUrl: './multi-select-dropdown.scss'
})
export class MultiSelectDropdown {
  @Input() options: string[] = [];

  @Input() selectedOptions: string[] = [];

  @Output() selectionChange = new EventEmitter<string[]>();

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSelection(option: string) {
    const index = this.selectedOptions.indexOf(option);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }
    this.selectionChange.emit(this.selectedOptions);
  }

  isSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }
}
