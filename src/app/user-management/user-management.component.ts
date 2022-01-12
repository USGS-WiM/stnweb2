import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { APP_UTILITIES } from '@app/app.utilities';
import { UserService } from '@services/user.service';
import { AgencyService } from '@services/agency.service';
import { RoleService } from '@services/role.service';
import { AddUserDialogComponent } from '@app/add-user-dialog/add-user-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';


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
  sortedData = [];
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
    public userService: UserService,
    public agencyService: AgencyService,
    public roleService: RoleService,
    public dialog: MatDialog,
  ) { }

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit(): void {

    // getting roles and initializing form
    this.getRoles()
    this.searchFormInit();
    this.getAgencies();
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
  getAgencies() {
    this.agencyService
      .getAllAgencies()
      .subscribe((results) => {
        this.agencies = results;
      });
  }

  refreshTable() {
    this.getUserData()
  }

  getUserData() {
    // get users
    this.userService
      .getAllUsers()
      .toPromise()
      .then((results) => {
        // adding the agency and role names to the user object 
        /* istanbul ignore next */
        if (results.length > 0) {
          this.users = results;
          this.formatData()
        }
      },
        error => this.isLoading = false);
  }

  /* istanbul ignore next */
  formatData() {
    // identifies the agency name and attaches it to user object
    if (this.users.length > 0) {
      for (const obj in this.users) {
        this.setAgency(obj)
      }
      this.isLoading = false;
      this.userDataSource.data = this.users;
      this.userDataSource.paginator = this.paginator;
      this.userDataSource.sort = this.sort;
      this.userDataSource.filterPredicate = this.getFilterPredicate();
    }
  }
  /* istanbul ignore next */
  setAgency(obj) {
    let agencyName = '';
    this.agencyService
      .getAnAgency(this.users[obj].agency_id)
      .toPromise()
      .then((agency) => {
        agencyName = agency.agency_name;
        this.users[obj].agency_n = agencyName;
      });

    const rolename = this.setRole(this.users[obj].role_id);
    this.users[obj].role_n = rolename;
  }

  setRole(roleId) {
    // set role name based on role id
    switch (roleId) {
      case 1:
        return "Admin";
      case 2:
        return "Manager";
      case 3:
        return "Field";
      case 4:
        return "Public";
    }
  }

  sortData(sort: Sort) {
    const data = this.userDataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'username': return APP_UTILITIES.COMPARE(a.username, b.username, isAsc);
        case 'lname': return APP_UTILITIES.COMPARE(a.lname, b.lname, isAsc);
        case 'fname': return APP_UTILITIES.COMPARE(a.fname, b.fname, isAsc);
        case 'email': return APP_UTILITIES.COMPARE(a.email, b.email, isAsc);
        case 'agency': return APP_UTILITIES.COMPARE(a.agency_n, b.agency_n, isAsc);
        case 'role': return APP_UTILITIES.COMPARE(a.role_n, b.role_n, isAsc);
        default: return 0;
      }
    });
  }

  /* this method well be called for each row in table  */
  /* istanbul ignore next */
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
  /* istanbul ignore next */
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

  openNewUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: {
        agencies: this.agencies,
        roles: this.roles
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'cancel') {
        return;
      } else {
        this.refreshTable();
      }
    });
  }

}
