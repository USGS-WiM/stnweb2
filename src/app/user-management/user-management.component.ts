import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { AgencyService } from '@services/agency.service';
import { RoleService } from '@services/role.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})

export class UserManagementComponent implements OnInit {
  userDataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  searchForm: FormGroup;
  username = '';
  fname = '';
  lname = '';
  agencies = [];
  users = [];
  roles = [];
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
    private agencyService: AgencyService,
    private roleService: RoleService,
  ) { }

  ngOnInit(): void {

    // getting roles and initializing form
    this.getRoles()
    this.searchFormInit();
  }

  searchFormInit() {
    this.searchForm = new FormGroup({
      username: new FormControl('', Validators.pattern('^[a-zA-Z ]+$')),
      fname: new FormControl('', Validators.pattern('^[a-zA-Z ]+$')),
      lname: new FormControl('', Validators.pattern('^[a-zA-Z ]+$')),
    });
  }
  getRoles() {
    this.roleService
      .getAllRoles()
      .subscribe((results) => {
        this.roles = results;
        this.getUserData();
      });
  }
  getUserData() {
    // get users
    this.userService
      .getAllUsers()
      .toPromise()
      .then((results) => {
        // adding the agency and role names to the user object 
        if (results.length > 0) {
          this.users = results;
          console.log(this.users)
          this.formatData()
        }
      },
        error => this.isLoading = false);
  }
  formatData() {
    // identifies the agency name and attaches it to user object
    for (const obj in this.users) {
      let agencyName = '';
      this.agencyService
        .getAnAgency(this.users[obj].agency_id)
        .toPromise()
        .then((agency) => {
          agencyName = agency.agency_name;
          this.users[obj].agency_n = agencyName;
        });

      // set role name based on role id
      const roleId = this.users[obj].role_id;
      switch (roleId) {
        case 1:
          this.users[obj].role_n = "Admin";
          break;
        case 2:
          this.users[obj].role_n = "Manager";
          break;
        case 3:
          this.users[obj].role_n = "Field";
          break;
        case 4:
          this.users[obj].role_n = "Public";
          break;
      }
    }
    this.isLoading = false;
    this.userDataSource.data = this.users;
    this.userDataSource.paginator = this.paginator;
    this.userDataSource.filterPredicate = this.getFilterPredicate();
  }

  /* this method well be called for each row in table  */
  getFilterPredicate() {
    return (row, filters: string) => {
      // split string per '$' to array
      const filterArray = filters.split('$');
      const username = filterArray[0];
      const fname = filterArray[1];
      const lname = filterArray[2];

      const matchFilter = [];

      // Fetch data from row
      const columnUsername = row.username;
      const columnFirstName = row.fname;
      const columnLastName = row.lname;

      // verify fetching data by our searching values
      const customFilterU = columnUsername.toLowerCase().includes(username);
      const customFilterFN = columnFirstName.toLowerCase().includes(fname);
      const customFilterLN = columnLastName.toLowerCase().includes(lname);

      // push boolean values into array
      matchFilter.push(customFilterU);
      matchFilter.push(customFilterFN);
      matchFilter.push(customFilterLN);

      // return true if all values in array is true
      // else return false
      return matchFilter.every(Boolean);
    };
  }
  applyFilter() {
    const un = this.searchForm.get('username').value;
    const fn = this.searchForm.get('fname').value;
    const ln = this.searchForm.get('lname').value;

    this.username = un === null ? '' : un;
    this.fname = fn === null ? '' : fn;
    this.lname = ln === null ? '' : ln;

    // create string of our searching values and split if by '$'
    const filterValue = this.username + '$' + this.fname + '$' + this.lname;
    this.userDataSource.filter = filterValue.trim().toLowerCase();
  }

}
