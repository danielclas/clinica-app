import { AuthenticationService } from './../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';

@Component({
  selector: 'app-staff-approval',
  templateUrl: './staff-approval.component.html',
  styleUrls: ['./staff-approval.component.css']
})
export class StaffApprovalComponent implements OnInit {

  users: User[] = [];
  constructor(private auth: AuthenticationService) { }

  ngOnInit(): void {
    this.getPendingApprovalList();
  }

  getPendingApprovalList(){
    this.auth.getAllUsers().snapshotChanges().subscribe(
      ref => {
        // res.forEach(a => console.log(a.payload.doc.get('type')));
        this.users = [];
        ref.forEach(
          item => {
            let doc = item.payload.doc;

            if(doc.get('type') == 'Staff' && !doc.get('enabled')){
              let user = new User();
              user.uid = doc.get('uid');
              user.name = doc.get('name');
              user.surname = doc.get('surname');
              user.specialties = doc.get('specialties');

              this.users.push(user);
            }
          }
        )
      }
    )
  }

  printSpecialties(user: User){

    let str: String = '';

    user.specialties.forEach( a => str += a + ' | ');

    return str.substring(0, str.length-2);
  }

  onApprove(user: User){
    this.auth.setUserApproval(user.uid);
  }

}
