import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    private permissions: any[] = [];

    constructor(private _userService: UserServiceProxy) {
    }
 
    getAllPermission() {
        this._userService.getAllPermission().subscribe(res => {
            this.permissions = res.data;
        }, () => {
            this.permissions = [];
        });
    }

    /**
     * Kiểm tra có permission không
     * @param permissionName
     * @returns
     */
    isGrantedRoot(permissionNames = []): boolean {
        for(let permissionName of permissionNames) {
            if(this.permissions.includes(permissionName)) return true;
        }
        return false;
    }
}
