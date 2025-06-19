import polyline from '@mapbox/polyline';
import * as turf from '@turf/turf';
import moment, {
  LocaleSpecifier,
  Moment,
  MomentFormatSpecification,
  MomentInput,
} from 'moment';
import * as momentTz from 'moment-timezone';
import QRCode from 'qrcode';
import { Md5 } from 'ts-md5';
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, validate } from 'uuid';
import * as xlsx from 'xlsx';
type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5';

interface UuidOptions {
  version?: UuidVersion;
  namespace?: string;
  name?: string;
}

export class Utility {
  // Cookie
  public static readonly COOKIE = {
    setCookie(name: string, value: string, days: number = 7): void {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = 'expires=' + date.toUTCString();
      document.cookie = `${name}=${value}; ${expires}; path=/`;
    },
    getCookie(name: string): string | null {
      const nameEQ = name + '=';
      const cookiesArray = document.cookie.split(';');
      for (let cookie of cookiesArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          return cookie.substring(nameEQ.length, cookie.length);
        }
      }
      return null;
    },
    deleteCookie(name: string): void {
      this.setCookie(name, '', -1);
    },
  };

  // Date Utility
  public static readonly DATEUtility = {
    JSDateIntoMoment(date: Date, locale?): moment.Moment {
      return moment(date, locale);
    },

    MomentDateIntoJS(date: moment.Moment): Date {
      return date.toDate();
    },

    createMoment(
      date: MomentInput,
      format?: MomentFormatSpecification,
      locale?: string,
    ): Moment {
      return moment(date, format, locale, true);
    },

    createMomentUTC(
      date: MomentInput,
      format?: MomentFormatSpecification,
      locale?: string,
    ): Moment {
      return moment.utc(date, format, locale, true);
    },

    getHour(date: moment.Moment): number {
      return date.hours();
    },
    getMinute(date: moment.Moment): number {
      return date.minutes();
    },
    getSecond(date: moment.Moment): number {
      return date.seconds();
    },
    setHour(date: moment.Moment, value: number): void {
      date.hours(value);
    },
    setMinute(date: moment.Moment, value: number): void {
      date.minutes(value);
    },
    setSecond(date: moment.Moment, value: number): void {
      date.seconds(value);
    },

    isDateInstance(obj: any): boolean {
      return moment.isMoment(obj);
    },

    toIso8601(date: Moment): string {
      return date.format();
    },

    addCalendarYears(date: Moment, years: number): Moment {
      return date.add({ years });
    },

    addCalendarMonths(date: Moment, months: number): Moment {
      return date.add({ months });
    },

    addCalendarDays(date: Moment, days: number): Moment {
      return date.add({ days });
    },

    format(date: Moment, displayFormat: string): string {
      return date.format(displayFormat);
    },

    clone(date: Moment, locale: LocaleSpecifier): Moment {
      return locale ? date.clone().locale(locale) : date.clone();
    },

    getTimeZone(cache: boolean = true) {
      return momentTz.tz.guess(cache);
    },

    getTodayAtMidnight(): Date {
      const today = new Date();
      today.setHours(0,0,0,0);
      return today
    }
  };

  // System
  public static readonly SYSTEM = {
    currentOsInfo: (): string => {
      if (navigator.platform.indexOf('Mac') !== -1) {
        return 'mac';
      } else if (navigator.platform.indexOf('Win') !== -1) {
        return 'windows';
      } else if (navigator.platform.indexOf('Linux') !== -1) {
        return 'linux';
      } else if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return 'mobile';
      }
      return 'unknown';
    },
  };

  // Object
  public static readonly OBJECT = {
    // Ex. [{id:1,name:'Mohan'}] => { 1: { id: 1, name: 'Mohan} }
    ArrayOfObject_Object_Key: (array: any[], key: string) => {
      const transformedObject: any = {};
      for (const item of array) {
        const keyValue = item[key];
        transformedObject[keyValue] = item;
      }
      return transformedObject;
    },
  };

  public static readonly MAPBOX = {
    // Ex: coordinates =  [ [38.5, -120.2], [40.7, -120.95], [43.252, -126.453] ]  output: '_p~iF~ps|U_ulLnnqC_mqNvxq`@'
    encodeCoordinate: (coordinates) => {
      return polyline.encode(coordinates);
    },

    // Ex: encodedCoordinate = '_p~iF~ps|U_ulLnnqC_mqNvxq`@'  output: [ [38.5, -120.2], [40.7, -120.95], [43.252, -126.453] ]
    decodeCoordinate: (encodedCoordinate) => {
      return polyline.decode(encodedCoordinate);
    },
  };

  public static readonly FILE = {
    getMIMEType: (file: File) => {
      return file.type;
    },

    getExtension: (file: File) => {
      return file ? file.name.split('.').pop()?.toLowerCase() : undefined;
    },

    // size will be return in mb.
    getFileSizeInMB: (file) => {
      return (file.size / (1024 * 1024)).toFixed(2);
    },

    // maxSizeInMB = 5 then it checks file is <=5
    isFileSizeValid: (file, maxSizeInMB) => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSizeInMB;
    },

    isValidFileExtension: (file, allowedExtensions) => {
      const extension: string = file.name.split('.').pop()?.toLowerCase();
      return allowedExtensions.includes(extension);
    },

    // Ex FileName = utility.component.html then return utility.component
    getFileNameWithoutExtension: (file) => {
      return file.name.split('.').slice(0, -1).join('.');
    },

    isImageFile: (file) => {
      return file.type.startsWith('image/');
    },

    isVideoFile: (file) => {
      return file.type.startsWith('video/');
    },

    isAudioFile: (file) => {
      return file.type.startsWith('audio/');
    },

    isPDFFile: (file) => {
      return file.type === 'application/pdf';
    },

    getFileURLTemporary: (file) => {
      return URL.createObjectURL(file);
    },

    // Ex newName = new-name.pdf
    renameFile: (file, newName) => {
      return new File([file], newName, { type: file.type });
    },

    getMimeType: (extension) => {
      const mimeTypes = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        txt: 'text/plain',
        csv: 'text/csv',
        json: 'application/json',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
      };
      return mimeTypes[extension];
    },

    validateFiles: (files, maxSizeInMB, allowedExtensions) => {
      return Array.from(files).every(
        (file) =>
          Utility.FILE.isFileSizeValid(file, maxSizeInMB) &&
          Utility.FILE.isValidFileExtension(file, allowedExtensions),
      );
    },

    createDownloadURL(data: any, type: string | undefined) {
      return window.URL.createObjectURL(new Blob([data], { type }));
    },

    downloadFile(filename = 'data', data: any, type: string | undefined) {
      const downloadUrl = this.createDownloadURL(data, type);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    },

    openDownLoadFileInNewTab(data: any, type: string | undefined) {
      window.open(this.createDownloadURL(data, type));
    },
    
    fileMimeType (type:string) {
      const obj = {
        'xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
      return obj[type] || 'Not Found'
    },

    // data = { sheet1: sheetData1 , sheet2: SheetData2 }
    createXLSheetBuffer (data:{ [ key:string ]: any[] }, formatOfOutput: 'array' | 'buffer' = 'array'):any  {
      let result = {}
      const webbook = xlsx.utils.book_new();
      Object.keys(data).forEach((ele:string,index) => {
          const worksheet : xlsx.WorkSheet = xlsx.utils.json_to_sheet(data[ele]);
          result = {...result, [ele] : worksheet }
          xlsx.utils.book_append_sheet(webbook,worksheet,ele);
      })
      const xlsheetbuffer = xlsx.write(webbook, { bookType: 'xlsx', type: formatOfOutput });
      return {...result, xlsheetbuffer, webbook};
    }
  };

  public static readonly DOCUMENT = {
    // check is that full screen
    isFullScreen: () => {
      return document.fullscreenElement;
    },
    // Enter fullscreen mode
    fullScreen: () => {
      document.documentElement.requestFullscreen();
    },

    // Exit fullscreen mode
    exitFullScreen: () => {
      document.exitFullscreen();
    },
  };

  public static readonly TURF = {
    // Ex. coordinates = [-75.343, 39.984] Longitude, Latitude
    getPoint: (coordinates) => {
      return turf.point(coordinates);
    },
    getDistance: (point1, point2, options: any = { units: 'kilometers' }) => {
      return turf.distance(point1, point2, options);
    },
    getBuffer: (point, options: any = { units: 'kilometers' }) => {
      return turf.buffer(point, 10, options);
    },

    // Ex. polygon = [[
    //  [-75.343, 39.984],
    //  [-75.534, 39.123],
    //  [-75.123, 39.456],
    //  [-75.343, 39.984]
    // ]]
    getPolygon: (polygon) => {
      return turf.polygon(polygon);
    },
    checkPointInsidePolygon: (point, polygon) => {
      return turf.booleanPointInPolygon(point, polygon);
    },
    Intersection: (polygon1, polygon2) => {
      return turf.intersect(polygon1, polygon2);
    },
    getLineString: (arrayOfcoordinates) => {
      return turf.lineString(arrayOfcoordinates);
    },
    getNearestPointOnLine: (
      line,
      point,
      options: any = { units: 'kilometers' },
    ) => {
      return turf.nearestPointOnLine(line, point, options);
    },
    getBoundingbox: (polygon) => {
      return turf.bbox(polygon);
    },
  };

  // QRCode
  public static readonly QRCode = {

    // Ex: data='https://www.google.com' options should be object
    generateQRCode: (data:string,options?:any) => {
      return QRCode.toDataURL(data,options)
    }
  };

  // TS-MD5 
  // Use for generating unique Id as checksum ; The output will always be the same hash for the same input
  public static TSMD5 = {
    getUniqueId : (input:string):string => {
      return Md5.hashStr(input)
    }
  }

  // UUID 
  // Use for generating unique Id 
  public static UUID = {
    generateUuid : ({ version = 'v4', namespace, name } : UuidOptions = {}): string => {
      switch (version) {
        case 'v1':
          return uuidv1();
        case 'v4':
          return uuidv4();
        case 'v3':
        case 'v5':
          // by this version uuid created used for checksum as well 
          if (!namespace || !name) {
            throw new Error(`For UUID ${version}, both namespace and name are required.`);
          }
          if (!validate(namespace)) {
            throw new Error(`Invalid namespace: ${namespace}. Namespace must be a valid UUID.`);
          }
          return version === 'v3' ? uuidv3(name, namespace) : uuidv5(name, namespace);
        default:
          throw new Error(`Unsupported UUID version: ${version}`);
      }
    }
  }

}
