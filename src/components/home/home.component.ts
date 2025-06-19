import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Issue, pageEvent, User } from '@model/app.model';
import { EllipsisPipe } from '@pipe/ellipsis.pipe';
import { HttpService } from '@services/http/http.service';
import { catchError, finalize, map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { TableComponent } from '@components/common/table/table.component';
import { PaginatorComponent } from '@components/common/paginator/paginator.component';
import { DEFAULT_PAGE_EVENT, HEADERS_WORKLOG } from '@constants/constants';
import { PageEvent } from '@angular/material/paginator';
import { Utility } from '@utilities/utility';
import { CustomDatePipe } from '@pipe/custom-date.pipe';
import {MatSnackBar} from '@angular/material/snack-bar';
import { duration } from 'moment';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatProgressSpinnerModule,
    HttpClientModule,
    EllipsisPipe,
    MatTooltipModule,
    FlexLayoutModule,
    MatDatepickerModule,
    JsonPipe,
    MatIconModule,
    TableComponent,
    PaginatorComponent,
    CustomDatePipe,
    MatSuffix,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers:[provideNativeDateAdapter()]
})
export class HomeComponent implements OnInit{

  readonly formGroup = new FormGroup({
    start: new FormControl<Date>(Utility.DATEUtility.getTodayAtMidnight(),[Validators.required]),
    end: new FormControl<Date>(Utility.DATEUtility.getTodayAtMidnight(),[Validators.required]),
    user : new FormControl(null,[Validators.required])
  });
  users!: User[]
  filteredUsers!: User[];
  isUserLoading:boolean = true;

  headers = HEADERS_WORKLOG
  $count!: number
  pageEvent: pageEvent = DEFAULT_PAGE_EVENT
  isExcelDownloading:boolean = false
  worklogRequest : boolean = false
  refreshEvent = new EventEmitter<any>()
  tableData = []
 private destroy$ = new Subject<void>();
  constructor(
    private httpService : HttpService,
    private snackbarService: MatSnackBar
  ){
    this.setUserApi()
  }

  ngOnInit(): void {
    this.formGroup.get('user')?.valueChanges.pipe().subscribe((res:any)=>{
      res && this.setFilteredUsers(res)
    });
  }

  setUserApi (){
    this.httpService.get<User[]>('api/worklog/users').pipe(
      finalize(() => this.isUserLoading = false),
      catchError((error)=>{
        return []
      }),
      map((users: User[]) =>{
        return users;
      }),
    ).subscribe({
      next: (users : User[]) => {
        this.users = this.filteredUsers = users
      },
      error: () => {
        this.users = []
      }
    });
    
  }

  private setFilteredUsers(value: string) : void {
    const filterValue = value.toLowerCase();
    this.filteredUsers= this.users.filter((user: User) => {
      return user.displayName?.toLowerCase().includes(filterValue);
    })
  }

  $api = (e: {}) => {
    let params = this.createParams()
    return this.httpService.get<Issue>('api/worklog/issues',{...params,...e}).pipe(
      map((res:Issue) => {
        this.$count = res.total
        return this.modifiedIssueResponse(res.issues)
      })
    )
  }

  private createParams(){
    const formGroupData = this.formGroup.getRawValue()
    let params:any = {maxResults: 10, startAt: 0}
    if(formGroupData.start && formGroupData.end){
      const startDate = Utility.DATEUtility.JSDateIntoMoment(formGroupData.start).format('YYYY-MM-DD')
      const endDate = Utility.DATEUtility.JSDateIntoMoment(formGroupData.end).format('YYYY-MM-DD')
      params = {  
        jql: `worklogDate >= "${startDate}" and worklogDate <= "${endDate}" and worklogAuthor= "${formGroupData.user}"  ORDER BY created DESC`,
        fields: 'summary,worklog',
        ...params
      }
    }
    return params
  }

  private modifiedIssueResponse(issues:any[]){
    const formGroupData = this.formGroup.getRawValue()
    let result = []
    issues.map((issue, index) => {
      const issueKey = issue.key
      const summary = issue.fields.summary
      const worklogs = issue.fields.worklog.worklogs

      const worklogWithIssueData = worklogs.map((worklog) => {
        if (!formGroupData.start || !formGroupData.end) {
          throw new Error('Start and end dates are required');
        }
        const userStartTime = new Date(formGroupData.start).getTime()
        const userEndTime = new Date(formGroupData.end).setHours(23, 59, 59, 999)
        const workLogStartTime = new Date(worklog.started).getTime()
        const workLogEndTime = new Date(worklog.created).getTime()

        const providedDisplayName = formGroupData.user
        const displayName = worklog.author.displayName

        const isWorkLogValid = userStartTime <= workLogStartTime && providedDisplayName === displayName
        if (isWorkLogValid) {
          return {
            ...worklog,
            issueKey: issueKey,
            summary: summary,
            timeSpend: worklog.timeSpent,
            workLogItem: `https://comprinno-tech.atlassian.net/browse/${issueKey}?focusedWorklogId=${worklog.id}`,
          }
        }
        return []
      }).filter((e) => e?.id);
      result = result.concat(worklogWithIssueData)
    })
    return result;
  }

  onPagaeChanged($event: PageEvent) {
    console.log('event page',$event)
    this.pageEvent = $event
  }

  onWorklogRequest(){
    if(this.formGroup.valid){
      this.worklogRequest = true
      this.pageEvent = DEFAULT_PAGE_EVENT
      this.refreshEvent.emit(true)
    }
  }

  triggerDownloadExcel(){
    this.generateExcelData()
  }

  generateExcelData(){
    let params = this.createParams()
    this.isExcelDownloading = true
    this.httpService.get<any>('api/worklog/issues-excel',{...params})
    .pipe(
      finalize(()=> this.isExcelDownloading = false)
    )
    .subscribe({
      next: (issues:any[]) => {
        const data:any[] =  this.modifiedIssueResponse(issues);
        this.beginDownloadProcess(data)
       this.snackbarService.open("File Downloaded Succesfully",'',{duration:2000})
      },
      error: (error) => {
        this.tableData = []
        this.snackbarService.open("File Downloaded Failed Retry",'',{duration:2000})
        console.error("Issues occure while fetching data api/worklog/issues-excel")
      }
    })
    
  }

  beginDownloadProcess(tableData:any[]){
    const form = this.formGroup.getRawValue()
    const pipe = new CustomDatePipe()
    const startDate = pipe.transform(form.start,'dd-MMM-yyyy')
    const endDate = pipe.transform(form.end,'dd-MMM-yyyy')

    const dataOfTable = tableData.map((e:any)=>{
      return {
        'WorkLog Id':e.id,
        issueKey:e.issueKey,
        summary:e.summary,
        timeSpend:e.timeSpend,
        Started:e.started,
        Ended: e.created
      }
    })

    let filename = startDate === endDate ? 
    `${form.user} ${startDate}` : 
    `${form.user} ${startDate}-${endDate}`;

    const data = {'Sheet1':dataOfTable}
    const { xlsheetbuffer , Sheet1 }= Utility.FILE.createXLSheetBuffer(data);
    const excelMimeType = Utility.FILE.fileMimeType('xlsx');
    Utility.FILE.downloadFile(filename,xlsheetbuffer,excelMimeType);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
