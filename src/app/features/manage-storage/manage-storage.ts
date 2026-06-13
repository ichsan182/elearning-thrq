import { Component } from '@angular/core';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-manage-storage',
  imports: [Navbar],
  templateUrl: './manage-storage.html',
  styleUrl: './manage-storage.css',
})
export class ManageStorage {
  readonly username = 'Admin';
}
