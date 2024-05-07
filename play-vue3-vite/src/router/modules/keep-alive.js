const route = [
  {
    name: "keep-alive-list",
    path: "/ka/list",
    component: () => import("@/views/keep-alive-test/list.vue"),
    meta: {
      title: "列表",
      keepAlive: true,
    },
  },
  {
    name: "keep-alive-detail",
    path: "/ka/detail/:id",
    component: () => import("@/views/keep-alive-test/detail.vue"),
    props: true,
    meta: {
      title: "详情A",
      keepAlive: true,
      activePath: "keep-alive-list",
    },
  },
  {
    name: "keep-alive-detail-b",
    path: "/ka/detailB",
    component: () => import("@/views/keep-alive-test/detailB.vue"),
    props: true,
    meta: {
      title: "详情B",
      activePath: "keep-alive-detail",
    },
  },
];

export default route;
