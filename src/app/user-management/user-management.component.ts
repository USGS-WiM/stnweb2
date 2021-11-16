import { Component, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  userDataSource = new MatTableDataSource([]);
  users = [];
  isLoading = true;
  displayedColumns: string[] = [
    'Username',
    'Last Name',
    'First Name',
    'Email',
    'Agency',
    'Role'
  ];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.getSiteSensorData()
  }

  createDataSource(data) {
    

  }
  getSiteSensorData() {
    this.userService
      .getAllUsers()
      .subscribe((results) => {
        this.isLoading = false;
        this.users = results;
        this.userDataSource.data = this.users;
        console.log(this.users)
      },
      error => this.isLoading = false);
  }

}
