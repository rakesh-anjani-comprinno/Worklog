import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import {
  DEFAULT_PAGEINDEX,
  DEFAULT_PAGESIZE,
  DEFAULT_PAGESIZE_OPTION,
} from '@constants/constants'

@Component({
  selector: 'app-paginator',
  imports: [MatPaginatorModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css',
})
export class PaginatorComponent implements OnInit {
  @Input() ariaLabel = 'Select Page'
  @Input() pageSizeOptions: number[] = DEFAULT_PAGESIZE_OPTION
  @Input() pageSize: number = DEFAULT_PAGESIZE
  @Input() pageIndex: number = DEFAULT_PAGEINDEX
  @Input() showFirstLastButtonsVisible: boolean = false
  @Input() totalItems: number
  @Output() pageChanged = new EventEmitter<PageEvent>()
  @ViewChild('paginator', { read: ElementRef }) paginatorEleRef: ElementRef

  constructor() {}

  ngOnInit(): void {}

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event)
  }

  ngAfterViewInit() {
    this.paginationLayoutChange()
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change['pageSize'] && !change['pageSize'].firstChange) {
      this.pageSize = change['pageSize'].currentValue
    }
    if (change['pageIndex'] && !change['pageIndex'].firstChange) {
      this.pageIndex = change['pageIndex'].currentValue
    }
  }
  
  // As per the our design pagniator is differ from angular material paginator
  paginationLayoutChange() {
    const paginatorElement = this.paginatorEleRef.nativeElement
    const paginatorPageSizeElement = paginatorElement.querySelector(
      '.mat-mdc-paginator-page-size'
    )
    if (paginatorPageSizeElement) {
      paginatorPageSizeElement.innerHTML = ''
      const spanElement = document.createElement('span')
      spanElement.textContent = `Issues per page: ${this.pageSize}`
      paginatorPageSizeElement.appendChild(spanElement)
    }
  }
}
