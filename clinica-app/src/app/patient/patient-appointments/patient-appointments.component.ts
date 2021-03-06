import { TranslationService } from 'src/app/translation.service';
import { AnimateGallery } from './../../animations';
import { Notification } from './../../models/notification';
import { NotifyService } from './../../services/notify.service';
import { AppointmentsService } from './../../services/appointments.service';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AppointmentStatus } from 'src/app/models/appointments';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.css'],
  animations: [AnimateGallery]
})
export class PatientAppointmentsComponent implements OnInit {

  status = AppointmentStatus;
  appointments = [];
  statusValues = [];
  statusSelected = [];
  filteredAppointments = [];
  selected;
  loading = true;

  constructor(
    public ts: TranslationService,
    private notify: NotifyService,
    private auth: AuthenticationService,
    private appoint: AppointmentsService) { }

  ngOnInit(): void {
    this.loading = true;
    this.statusValues = Object.values(this.status);
    this.appoint.getPatientAppointments(this.auth.currentUser.uid)
    .snapshotChanges().subscribe(
      ref => {
        this.appointments = [];
        ref.forEach(
          item => {
            let doc = item.payload.doc;
            let professional = doc.get('professional');
            let include = [this.status.Done, this.status.Rejected].some(a => a == doc.get('status'));

            if(!include && doc.get('date').toDate() > Date.now()){
              this.appoint.getPatientInfo(professional).subscribe(
                res => {

                  let user = res.docs[0];
                  this.appointments.push({
                    'status': doc.get('status'),
                    'date': doc.get('date').toDate(),
                    'professional': user.get('name') + ' ' + user.get('surname'),
                    'staffuid': user.get('uid'),
                    'uid': doc.id
                  });
              });
            }
          }
        )

        this.loading = false;
        this.filterAppointments();
      }
    )
  }

  onStatusSelected(status){
    if(this.statusSelected.some(s => s == status)){
      this.statusSelected = this.statusSelected.filter(s => s != status);
    }else{
      this.statusSelected.push(status);
    }

    this.filterAppointments();
  }

  filterAppointments(){
    if(this.statusSelected.length == 0){
      this.filteredAppointments = this.appointments;
    }else{
      this.filteredAppointments = this.appointments.filter(a => this.statusSelected.includes(a.status));
    }
  }

  onRowSelected(selected){
    if(selected == this.selected) this.selected = undefined;
    else this.selected = selected;
  }

  onUpdateStatus(status: AppointmentStatus){

    this.loading = true;
    let patient = this.auth.currentUser.name + ' ' + this.auth.currentUser.surname;
    let message = 'Su turno con el paciente ' + patient + ' para el día ' + this.selected.date + ' cambió al estado ' + status;

    this.appoint.updateAppointmentStatus(status, this.selected.uid).then(
      () => {
        this.loading = false;
        this.notify.toastNotify('Estado de turno actualizado', 'El estado del turno fue cambiado a <b>' + status + '</b>');
        this.notify.pushNotify(new Notification(new Date(), this.selected.staffuid, message));
        this.selected = undefined;
      },
      () => {
        this.loading = false;
        this.notify.toastNotify('Error actualizando el turno', 'El estado del turno no pudo ser actualizado');
      }
    );
  }

}
