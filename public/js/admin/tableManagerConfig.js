
import { 
  orderRowRenderer, 
  redirectRowRenderer, 
  userRowRenderer, 
  leadRowRenderer ,
  renderCouponRow,
  productRowRenderer,
  locationRowRenderer,
  supportRowRenderer,
  blogRowRenderer,
  pageRowRenderer,
  productCardRenderer,
  abRowRenderer
} from './tableRowRenderers.js';

export const tableManagerConfigs = {
  orders: {
    tableName: 'orders',
    apiRoute: '/api/v1/orders?paymentStatus=paid',
    rowRenderer: orderRowRenderer,
    mobileRenderer: orderRowRenderer, 
    defaultSortField: '-createdAt',
    containerId: 'tBody',
    mobileContainerId: 'ordersTableBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
      prev: 'prevButton',
      next: 'nextButton',
      info: 'paginationInfo'
    }
  },

  abandoned: {
    tableName: 'orders',
    apiRoute: '/api/v1/orders?paymentStatus=pending,failed&paymentType=direct',
    rowRenderer: orderRowRenderer,
    mobileRenderer: orderRowRenderer, 
    defaultSortField: '-createdAt',
    containerId: 'tBody',
    mobileContainerId: 'ordersTableBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
      prev: 'prevButton',
      next: 'nextButton',
      info: 'paginationInfo'
    }
  },

  phonePayment: {
    tableName: 'orders',
    apiRoute: '/api/v1/orders?paymentType=paymentPhone',
    rowRenderer: orderRowRenderer,
    mobileRenderer: orderRowRenderer, 
    defaultSortField: '-createdAt',
    containerId: 'tBody',
    mobileContainerId: 'ordersTableBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
      prev: 'prevButton',
      next: 'nextButton',
      info: 'paginationInfo'
    }
  },
  
  users: {
    tableName: 'users',
    apiRoute: '/api/v1/users',
    rowRenderer: userRowRenderer,
    mobileRenderer: userRowRenderer,
    defaultSortField: 'name',
    containerId: 'tBody',
    mobileContainerId: 'usersTableBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
      prev: 'prevButton',
      next: 'nextButton',
      info: 'paginationInfo'
    }
  },

  leads: {
    tableName: 'contact',
    apiRoute: '/api/v1/contact',
    rowRenderer: leadRowRenderer,
    mobileRenderer: leadRowRenderer,
    defaultSortField: '-createdAt',
    containerId: 'tBody',
    mobileContainerId: 'leadsTableBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
      prev: 'prevButton',
      next: 'nextButton',
      info: 'paginationInfo'
    }
  },

  redirects: {
    tableName: 'redirect',
    apiRoute: '/api/v1/redirect',
    rowRenderer: redirectRowRenderer,
    mobileRenderer: redirectRowRenderer,
    defaultSortField: 'createdAt',
    containerId: 'tBody',
    mobileContainerId: 'redirectsTableBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
      prev: 'prevButton',
      next: 'nextButton',
      info: 'paginationInfo'
    }
  },

  coupons: {
    tableName: 'coupon',
    apiRoute: '/api/v1/coupon',
    rowRenderer: renderCouponRow,
    defaultSortField: 'expirationDate',
    containerId: 'tBody',
    searchInputId: 'tableUserSearchInput',
    paginationControls: {
        prev: 'prevButton',
        next: 'nextButton',
        info: 'paginationInfo'
    }
},
  products: {
    tableName: "product",
    rowRenderer: productRowRenderer,
    mobileRenderer: productRowRenderer,
    defaultSortField: "name",
    containerId: "tBody",
    mobileContainerId: "productTableBody",
    searchInputId: "productSearchInput",
    paginationControls: {
        prev: "prevButton",
        next: "nextButton",
        info: "paginationInfo"
    },
},
blog: {
  tableName: "blog",
  rowRenderer: blogRowRenderer,
  mobileRenderer: productRowRenderer,
  defaultSortField: "name",
  containerId: "tBody",
  mobileContainerId: "productTableBody",
  searchInputId: "productSearchInput",
  paginationControls: {
      prev: "prevButton",
      next: "nextButton",
      info: "paginationInfo"
  },
},
  dealers: {
    tableName: "location",
    rowRenderer: locationRowRenderer,
    mobileRenderer: locationRowRenderer, 
    defaultSortField: "name",
    containerId: "tBody",
    mobileContainerId: "tBody",
    searchInputId: "tableUserSearchInput",
    paginationControls: {
        prev: "prevButton",
        next: "nextButton",
        info: "paginationInfo",
    },
  },
  support: {
    tableName: "video-support",
    rowRenderer: supportRowRenderer,
    mobileRenderer: supportRowRenderer, 
    defaultSortField: "createdAt",
    containerId: "tBody",
    mobileContainerId: "tBody",
    searchInputId: "tableUserSearchInput",
    paginationControls: {
        prev: "prevButton",
        next: "nextButton",
        info: "paginationInfo",
    },
  },
  pages: {
    tableName: "pages",
    rowRenderer: pageRowRenderer,
    mobileRenderer: pageRowRenderer, 
    defaultSortField: "createdAt",
    containerId: "tBody",
    mobileContainerId: "tBody",
    searchInputId: "tableUserSearchInput",
    paginationControls: {
        prev: "prevButton",
        next: "nextButton",
        info: "paginationInfo",
    },
  },

  abtests: {
    tableName: "ab-test",
    rowRenderer: abRowRenderer,
    mobileRenderer: abRowRenderer, 
    defaultSortField: "createdAt",
    containerId: "tBody",
    mobileContainerId: "tBody",
    searchInputId: "tableUserSearchInput",
    paginationControls: {
        prev: "prevButton",
        next: "nextButton",
        info: "paginationInfo",
    },
  },

  parts: {
    tableName: 'product',
    apiRoute: '/api/v1/product?category=67bd69a3c1d73e0a72d9ff92',
    rowRenderer: productCardRenderer,
    mobileRenderer: productCardRenderer, 
    defaultSortField: "createdAt",
    limit: 50,
    containerId: "catAllPrdContainer",
    mobileContainerId: "catAllPrdContainer",
    searchInputId: "searchPrd",
    paginationControls: {
        prev: "prevButton",
        next: "nextButton",
        info: "paginationInfo",
    },
    filterConfig: {
      category: '#catType'
    }
  },
};


