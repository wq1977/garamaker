<template>
  <div :id="id" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title">节奏编辑</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form>
        <div class="form-row">
          <div class="col-4">
            <input type="text" v-model="name" class="form-control" placeholder="节奏名称">
          </div>
          <div class="col-8">
            <input type="text" v-model="chord" class="form-control" placeholder="节奏定义">
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
      <button @click="okcb(name, chord)" type="button" class="btn btn-primary">保存</button>
    </div>
    </div>
  </div>
  </div>   
</template>
<script>
export default {
  data: () => ({
    name: '',
    chord: ''
  }),
  props: {
    id: null,
    okcb: null
  }
}
</script>

