import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator'
import { MatSort, MatSortModule } from '@angular/material/sort'
import { NgClass, NgTemplateOutlet } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { ObjectUtils } from '@utilities/object.utils'
import { FormUtils } from '@utilities/form.utils'
import { finalize, map, pipe, Subscription } from 'rxjs'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    NgTemplateOutlet,
    NgClass,
    MatProgressSpinnerModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  @Input() ariaLabel = 'Table Data'
  @Input() headers!: any[]
  @Input() templates = {} as any
  @Input() apiList!: any

  public dataSource: MatTableDataSource<any> = new MatTableDataSource<any>()
  public columns!: any[]

  // Related to Paginator
  @Input() pageEvent: { pageSize: number; pageIndex: number }

  // Sorting
  @ViewChild(MatSort) sort!: MatSort
  @Input() sortColumn!: any
  @Input() sortOrder: 'asc' | 'desc' | '' = 'asc'

  // Row Click
  @Input() isRowClickable: boolean = false
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>()

  // filters
  @Input() filters
  @Input() filterTemplates
  @Input() filterForm

  // queryParams
  @Input() isQueryParamEnabled = true

  @Input() refreshEvent!: EventEmitter<any>
  private subscriptions: Subscription[] = []

  isTableLoading:boolean = true;
  @Input() tableLoadingClass:string
  @Input() emptyTemplate:TemplateRef<any>

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.columns = this.headers.map((e) => e?.value)
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change['pageEvent'] && !change['pageEvent'].firstChange) {
      this.isTableLoading = true
      this.pageEvent = change['pageEvent'].currentValue
      this.listRequest()
      this.updateQueryParam()
    }
  }

  onRowClick(row: any) {
    this.rowClick.emit(row)
  }

  applyFilterToDataSource(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if(this.sortColumn){
        this.dataSource.sort = this.sort
        this.sort.active = this.sortColumn
        this.sort.direction = this.sortOrder
      }

      this.sort?.sortChange.subscribe(() => {
        this.sortColumn = this.sort.active
        this.sortOrder = this.sort.direction
        this.listRequest()
        this.updateQueryParam()
      })

      const queryParams = ObjectUtils.cleanObject(
        this.activatedRoute.snapshot.queryParams
      )
      if (this.filterForm) {
        this.filterForm.patchValue(queryParams)
        this.filterForm.valueChanges.subscribe((formValues) => {
          this.listRequest()
          this.updateQueryParam()
        })
      }

      this.refreshEvent && this.subscriptions.push(this.refreshEvent.subscribe(()=>{
        this.isTableLoading = true
        this.listRequest()
      }))
      this.listRequest()
    }, 0)
  }

  listRequest() {
    this.apiList(
      ObjectUtils.cleanObject({
        startAt: this.pageEvent?.pageIndex * this.pageEvent?.pageSize,
        maxResults: this.pageEvent?.pageSize,
        sortBy: this.sort?.active ?? null,
        sort: this.sort?.direction ?? null,
        ...this.getFormValues(),
      })
    ).pipe(finalize(()=> this.isTableLoading = false))
    .subscribe((res: any) => {
      this.dataSource.data = res
    })
  }

  private getFormValues() {
    const values = ObjectUtils.cleanObject(
      this.filterForm ? this.filterForm.getRawValue() : {}
    )
    return Object.keys(values).reduce((acc, key) => {
      const value = values[key]
      acc[key] = Array.isArray(value) ? value.join(',') : value
      return acc
    }, {})
  }

  private updateQueryParam() {
    if (this.isQueryParamEnabled) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: ObjectUtils.cleanObject({
          ...this.getFormValues(),
          page: (+this.pageEvent?.pageIndex || 0) + 1,
          maxResults: this.pageEvent?.pageSize,
          sortBy: this.sort?.active,
          sort: this.sort?.direction,
        }),
      })
    }
  }
}
