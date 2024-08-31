<template>
  <div class="card">
    <div class="card-header pb-0">
      <h6>白名单请求</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
          <tr>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">ID</th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Name</th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">UUID</th>
            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Time</th>
            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in authors" :key="item._id">
            <td><p class="text-xs font-weight-bold mb-0">{{ index + 1 }}</p></td>
            <td><p class="text-xs text-secondary mb-0">{{ item.name }}</p></td>
            <td><p class="text-xs text-secondary mb-0">{{ item.uuid }}</p></td>
            <td class="align-middle text-center"><span class="text-secondary text-xs font-weight-bold">{{ item.time }}</span></td>
            <td class="align-middle text-center text-sm">
                <span :class="['badge badge-sm', statusClass(item.status)]">
                  {{ item.status }}
                </span>
            </td>
            <td class="align-middle text-center actions pt-4">
              <button class="btn btn-success btn-sm" @click="showModal(item.uuid, 'accept')">Accept</button>
              <button class="btn btn-danger btn-sm ms-2" @click="showModal(item.uuid, 'reject')">Reject</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div v-if="isModalVisible" class="modal fade show modal-overlay" style="display: block;" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirmationModalLabel">Confirm Action</h5>
          <button type="button" class="close" aria-label="Close" @click="closeModal" ref="someButtonRef">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <h3>Confirm {{ actionText }}</h3>
          <p>Are you sure you want to {{ actionText }} this author?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="confirmAction">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      authors: [],
      selectedUuid: '',
      actionType: '',
      actionText: '',
      isModalVisible: false
    };
  },
  created() {
    this.fetchAuthors();
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('userToken');
    }
  },
  methods: {
    async fetchAuthors() {
      try {
        const response = await axios.get('http://localhost:19198/lists');
        this.authors = response.data;
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    },
    showModal(uuid, action) {
      if (!this.isLoggedIn) {
        alert('You need to be logged in to perform this action.');
        // Optionally, redirect to login page
        // this.$router.push('/login');
        return;
      }
      this.selectedUuid = uuid;
      this.actionType = action;
      this.actionText = action === 'accept' ? 'Accept' : 'Reject';
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.$refs.someButtonRef.focus();
    },
    async confirmAction() {
      if (!this.isLoggedIn) {
        alert('You need to be logged in to perform this action.');
        return;
      }

      const status = this.actionType === 'accept' ? 'accepted' : 'rejected';
      try {
        await axios.put(`http://localhost:19198/lists/${this.selectedUuid}`,
            { status },
            { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } }
        );
        this.closeModal();
        this.fetchAuthors();
      } catch (error) {
        console.error(`Error updating status for UUID ${this.selectedUuid}:`, error);
        alert('Failed to update status. Please check your token or try again after sign in.');
      }
    },
    statusClass(status) {
      switch (status) {
        case 'accepted':
          return 'bg-gradient-success';
        case 'rejected':
          return 'bg-gradient-danger';
        case 'none':
        default:
          return 'bg-gradient-secondary';
      }
    }
  }
};
</script>

<style scoped>
.table td, .table th {
  padding: 0.5rem;
}

.uuid, .author {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.actions a {
  margin: 0;
  padding: 0;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.actions .text-success {
  margin-right: 4px;
}

.actions .text-danger {
  margin-left: 4px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.bg-gradient-success {
  background-color: #28a745;
  color: #fff;
}

.bg-gradient-danger {
  background-color: #dc3545;
  color: #fff;
}

.bg-gradient-secondary {
  background-color: #6c757d;
  color: #fff;
}

.modal.show {
  display: block;
  background: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  margin: 1.75rem auto;
}

.modal-content {
  border-radius: 0.375rem;
  background-color: #fff;
  border: 1px solid #dee2e6;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.close {
  margin: -0.5rem -0.5rem -0.5rem auto;
  padding: 0.5rem;
  background: transparent;
  border: 0;
  -webkit-appearance: none;
}

.close span {
  font-size: 1.5rem;
  line-height: 1;
}
</style>
