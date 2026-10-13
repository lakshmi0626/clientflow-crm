import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Building2, CalendarClock,
  Check, ChevronDown, CircleHelp, ClipboardList, Command, Download, Filter,
  LayoutDashboard, LifeBuoy, Menu, Plus, Search, Settings, ShieldCheck,
  Sparkles, Target, TrendingUp, Users, X, Zap, MoreHorizontal, Mail, Phone, Pencil, Trash2,
  CircleDollarSign, Clock3, BriefcaseBusiness
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell
} from 'recharts'
import { api } from './api'

const stages = ['New', 'Contacted', 'Negotiation', 'Won', 'Lost']
const colors = ['#6f72f5', '#36b9a0', '#f2b84b', '#4f8ff7', '#e47a8a']
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)
const initials = name => (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
const fallbackDashboard = { totalLeads: 0, activeLeads: 0, totalCustomers: 0, pendingTasks: 0, wonRevenue: 0, pipeline: {}, recentLeads: [] }

export default function App() {
  const [page, setPage] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])
  const [tasks, setTasks] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All stages')
  const [modal, setModal] = useState('')
  const [editingLead, setEditingLead] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [taskQuery, setTaskQuery] = useState('')
const [taskStatus, setTaskStatus] = useState('All statuses')
const [taskPriority, setTaskPriority] = useState('All priorities')
  const [busy, setBusy] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setBusy(true); setError('')
    try {
      const [d, l, c, t] = await Promise.all([api.dashboard(), api.leads(), api.customers(), api.tasks()])
      setDashboard(d); setLeads(l); setCustomers(c); setTasks(t)
    } catch (e) {
      setError('Cannot connect to the API. Start the Spring Boot backend on port 8080, then click Retry.')
    } finally { setBusy(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const filteredLeads = useMemo(() => leads.filter(l => {
    const matchesQuery = [l.name, l.company, l.email, l.owner].join(' ').toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (filter === 'All stages' || l.status === filter)
  }), [leads, query, filter])

  async function createLead(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const lead = {
      name: form.get('name'), company: form.get('company'), email: form.get('email'),
      phone: form.get('phone'), source: form.get('source'), owner: form.get('owner'),
      status: form.get('status'), dealValue: Number(form.get('dealValue') || 0), createdAt: new Date().toISOString().slice(0, 10)
    }
    try { if (editingLead?.id) { await api.updateLead(editingLead.id, lead); setNotice('Lead updated successfully') } else { await api.createLead(lead); setNotice('Lead created successfully') } setModal(''); setEditingLead(null); await refresh() }
    catch (e) { setNotice(`Could not save lead: ${e.message}`) }
  }

  async function updateStatus(id, status) {
    try { await api.updateLeadStatus(id, status); setNotice('Lead stage updated'); await refresh() }
    catch { setNotice('Unable to update lead stage') }
  }

  async function deleteLead(id) {
    if (!window.confirm('Delete this lead? This action cannot be undone.')) return
    try { await api.deleteLead(id); setNotice('Lead deleted'); await refresh() }
    catch { setNotice('Unable to delete lead') }
  }

  async function deleteCustomer(id) {
    if (!window.confirm('Delete this customer? This action cannot be undone.')) return
    try { await api.deleteCustomer(id); setNotice('Customer deleted'); await refresh() }
    catch (e) { setNotice(`Unable to delete customer: ${e.message}`) }
  }

  async function createTask(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const task = {
      title: form.get('title'),
      customerName: form.get('customerName'),
      assignee: form.get('assignee'),
      dueDate: form.get('dueDate'),
      priority: form.get('priority'),
      status: form.get('status') || 'Pending'
    }
    try {
      if (editingTask?.id) {
        await api.updateTask(editingTask.id, task)
        setNotice('Follow-up task updated')
      } else {
        await api.createTask(task)
        setNotice('Follow-up task created')
      }
      setModal(''); setEditingTask(null); await refresh()
    } catch (e) { setNotice(`Could not save follow-up: ${e.message}`) }
  }

  async function deleteTask(id) {
    if (!window.confirm('Delete this follow-up? This action cannot be undone.')) return
    try {
      await api.deleteTask(id)
      setNotice('Follow-up deleted')
      await refresh()
    } catch (e) { setNotice(`Unable to delete follow-up: ${e.message}`) }
  }

  const navGroups = [
    { label: 'WORKSPACE', items: [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Leads', icon: Target, count: leads.length }, { name: 'Customers', icon: Users }, { name: 'Follow-ups', icon: CalendarClock }] },
    { label: 'INSIGHTS', items: [{ name: 'Reports', icon: Activity }] },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Command size={21}/></div><span>clientflow<span className="brand-dot">.</span></span><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">N</div><div className="workspace-text"><strong>ClientFlow Workspace</strong><span>Business workspace</span></div><ChevronDown size={15}/></div>
      <nav>
        {navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => {
          const Icon = item.icon
          return <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => {setPage(item.name); setMobileNav(false)}}><Icon size={18}/><span>{item.name}</span>{item.count !== undefined && <span className="nav-count">{item.count}</span>}</button>
        })}</div>)}
      </nav>
      <div className="sidebar-spacer"/>
      <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Make more happen</strong><p>Bring every customer conversation into one place.</p><button onClick={() => setNotice('You are viewing the CRM starter workspace.')}>Explore workspace <ArrowUpRight size={14}/></button></div>
      <button className="nav-item"><Settings size={18}/><span>Settings</span></button>
      <button className="nav-item"><LifeBuoy size={18}/><span>Help & support</span></button>
      <div className="profile"><div className="profile-avatar">CA</div><div className="profile-info"><strong>Workspace Admin</strong><span>Workspace admin</span></div><MoreHorizontal size={19}/></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
        <div className="top-actions"><div className="search-global"><Search size={16}/><input placeholder="Search anything..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn notification-btn" onClick={() => setPage('Follow-ups')} aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">CA</div></div>
      </header>

      <div className="content">
        {error && <div className="error-banner"><span>{error}</span><button onClick={refresh}>Retry</button></div>}
        {notice && <div className="toast"><Check size={16}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
        {page === 'Overview' && <Overview dashboard={dashboard} leads={leads} tasks={tasks} setPage={setPage} setModal={setModal} busy={busy}/>}
        {page === 'Leads' && <LeadsPage leads={filteredLeads} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} setModal={setModal} setEditingLead={setEditingLead} updateStatus={updateStatus} deleteLead={deleteLead}/>}
        {page === 'Customers' && <CustomersPage customers={customers} query={query} setQuery={setQuery} setModal={setModal} setEditingCustomer={setEditingCustomer} deleteCustomer={deleteCustomer}/>}
        {page === 'Follow-ups' && (
  <TasksPage
    tasks={tasks}
    setModal={setModal}
    setEditingTask={setEditingTask}
    deleteTask={deleteTask}
    taskQuery={taskQuery}
    setTaskQuery={setTaskQuery}
    taskStatus={taskStatus}
    setTaskStatus={setTaskStatus}
    taskPriority={taskPriority}
    setTaskPriority={setTaskPriority}
  />
)} 
        {page === 'Reports' && <ReportsPage dashboard={dashboard} leads={leads}/>}
      </div>
      <footer className="footer"><span>© 2026 ClientFlow, Inc.</span><span><span className="online-dot"/> All systems operational</span><span>Made for better customer relationships</span></footer>
    </main>

    {modal === 'lead' && <Modal title={editingLead ? "Edit lead" : "Add new lead"} subtitle="Manage a prospect in your sales pipeline." onClose={() => {setModal('');setEditingLead(null)}}><form className="modal-form" onSubmit={createLead}>
      <div className="form-grid"><Field label="Full name"><input name="name" defaultValue={editingLead?.name || ''} placeholder="e.g. Aisha Patel" required/></Field><Field label="Company"><input name="company" defaultValue={editingLead?.company || ''} placeholder="Company name" required/></Field><Field label="Email address"><input name="email" type="email" defaultValue={editingLead?.email || ''} placeholder="name@company.com" required/></Field><Field label="Phone number"><input name="phone" defaultValue={editingLead?.phone || ''} placeholder="+91 98765 43210"/></Field><Field label="Lead source"><select name="source" defaultValue={editingLead?.source || 'Website'}><option>Website</option><option>Referral</option><option>LinkedIn</option><option>Campaign</option><option>Event</option></select></Field><Field label="Assigned to"><select name="owner" defaultValue={editingLead?.owner || 'Maya'}><option>Maya</option><option>Arjun</option><option>Riya</option><option>Workspace Admin</option></select></Field><Field label="Deal value (₹)"><input name="dealValue" type="number" min="0" defaultValue={editingLead?.dealValue ?? 0}/></Field><Field label="Stage"><select name="status" defaultValue={editingLead?.status || 'New'}>{stages.map(s => <option key={s}>{s}</option>)}</select></Field></div>
      <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setModal('')}>Cancel</button><button className="btn-primary" type="submit"><Plus size={16}/> {editingLead ? "Save changes" : "Create lead"}</button></div>
    </form></Modal>}
    {modal === 'task' && <Modal title={editingTask ? 'Edit follow-up' : 'Create follow-up'} subtitle="Keep the next customer touchpoint on track." onClose={() => {setModal('');setEditingTask(null)}}><form className="modal-form" onSubmit={createTask}>
      <Field label="Task title"><input name="title" placeholder="e.g. Follow up on proposal" required defaultValue={editingTask?.title || ''}/></Field><Field label="Customer / company"><input name="customerName" placeholder="Company name" required defaultValue={editingTask?.customerName || ''}/></Field><div className="form-grid"><Field label="Assigned to"><select name="assignee" defaultValue={editingTask?.assignee || 'Maya'}><option>Maya</option><option>Arjun</option><option>Riya</option><option>Workspace Admin</option></select></Field><Field label="Due date"><input name="dueDate" type="date" required defaultValue={editingTask?.dueDate || new Date().toISOString().slice(0,10)}/></Field><Field label="Priority"><select name="priority" defaultValue={editingTask?.priority || 'Medium'}><option>Medium</option><option>High</option><option>Low</option></select></Field><Field label="Status"><select name="status" defaultValue={editingTask?.status || 'Pending'}><option>Pending</option><option>Completed</option></select></Field></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => {setModal('');setEditingTask(null)}}>Cancel</button><button className="btn-primary" type="submit"><Check size={16}/> {editingTask ? 'Save changes' : 'Create task'}</button></div>
    </form></Modal>}
    {modal === 'customer' && <Modal title={editingCustomer ? 'Edit customer' : 'Add customer'} subtitle="Save customer details in your directory." onClose={() => {setModal('');setEditingCustomer(null)}}><CustomerForm initialData={editingCustomer} onCancel={() => {setModal('');setEditingCustomer(null)}} onSave={async data => {try {if(editingCustomer?.id){await api.updateCustomer(editingCustomer.id,data);setNotice('Customer updated')}else{await api.createCustomer(data);setNotice('Customer created')}setModal('');setEditingCustomer(null);await refresh()} catch (e) {setNotice(`Could not save customer: ${e.message}`)}}}/></Modal>}
  </div>
}


function Overview({ dashboard, leads, tasks, setPage, setModal, busy }) {
  const stageData = stages.map((name, i) => ({
    name,
    value: dashboard.pipeline?.[name] || 0,
    color: colors[i]
  }))

  const pendingTasks = tasks.filter(
    task => (task.status || 'Pending') !== 'Completed'
  ).length

  const now = new Date()

const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0')
].join('-')

  const overdueTasks = tasks.filter(task =>
    task.dueDate &&
    task.dueDate.slice(0, 10) < today &&
    (task.status || 'Pending') !== 'Completed'
  ).length

  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')

    const count = leads.filter(
      lead => (lead.createdAt || '').slice(0, 10) === dateKey
    ).length

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: count
    }
  })
  return <>
    <div className="page-heading"><div><div className="eyebrow"><Sparkles size={13}/> YOUR BUSINESS AT A GLANCE</div><h1>Welcome to ClientFlow <span className="wave">✳</span></h1><p>Here's what's happening with your customer relationships today.</p></div><div className="heading-actions"><button className="btn-secondary" onClick={() => setPage('Reports')}><Download size={16}/> Export report</button><button className="btn-primary" onClick={() => {setEditingLead(null);setModal('lead')}}><Plus size={17}/> Add lead</button></div></div>
    <div className="date-line"><span className="date-chip"><CalendarClock size={14}/> {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</span><span className="live-chip"><span className="online-dot"/> Live overview</span></div>
    <section className="stats-grid">
      
<StatCard icon={Target} tint="purple" label="Total leads" value={dashboard.totalLeads} trend="All leads" direction="none" foot="Saved CRM records"/>

<StatCard icon={Users} tint="green" label="Active opportunities" value={dashboard.activeLeads} trend="In progress" direction="none" foot="Current pipeline"/>

<StatCard icon={Building2} tint="blue" label="Customers" value={dashboard.totalCustomers} trend="Customers" direction="none" foot="Saved customer records"/>
      <StatCard icon={CircleDollarSign} tint="orange" label="Won revenue" value={money(dashboard.wonRevenue)} trend="Closed won" direction="none" foot="all-time"/>
      
  <StatCard
    icon={ClipboardList}
    tint="blue"
    label="Pending follow-ups"
    value={pendingTasks}
    trend="Needs attention"
    direction="none"
    foot="Tasks not completed"
  />
  <StatCard
    icon={Clock3}
    tint="orange"
    label="Overdue follow-ups"
    value={overdueTasks}
    trend="Past due date"
    direction="none"
    foot="Pending past-due tasks"
  />

      <StatCard
  icon={Check}
  tint="green"
  label="Converted leads"
  value={leads.filter(lead => lead.status === 'Won').length}
  trend="Successfully won"
  direction="none"
  foot="Closed deals"
/>
    </section>
    <section className="overview-grid">
      <div className="panel revenue-panel"><div className="panel-heading"><div><h2>Pipeline activity</h2><p>New leads created in the last 7 days</p></div><button className="select-like" onClick={() => setPage('Reports')}>This week <ChevronDown size={14}/></button></div><div className="chart-summary"><strong>{dashboard.totalLeads}</strong><span>Total leads in pipeline</span><span className="mini-positive"><ArrowUpRight size={14}/> Active</span></div><div className="area-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:8,left:-24,bottom:0}}><defs><linearGradient id="fillActivity" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7777f6" stopOpacity={0.22}/><stop offset="100%" stopColor="#7777f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#edf0f6"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#939bb0',fontSize:11}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#939bb0',fontSize:11}}/><Tooltip contentStyle={{border:'1px solid #eceef5',borderRadius:12,fontSize:12}}/><Area type="monotone" dataKey="value" stroke="#7777f6" strokeWidth={2.5} fill="url(#fillActivity)" activeDot={{r:5,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot purple-dot"/> Lead activity</span><span className="chart-note">Leads grouped by creation date</span></div></div>
      <div className="panel pipeline-panel"><div className="panel-heading"><div><h2>Sales pipeline</h2><p>Leads by current stage</p></div><button className="icon-btn" onClick={() => setPage('Leads')}><MoreHorizontal size={19}/></button></div><div className="donut-wrap"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={68} paddingAngle={3} stroke="none">{stageData.map((entry,i)=><Cell key={entry.name} fill={entry.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="donut-center"><strong>{dashboard.totalLeads}</strong><span>Total leads</span></div></div><div className="stage-legend">{stageData.map(s=><div className="stage-row" key={s.name}><span className="stage-name"><i style={{background:s.color}}/>{s.name}</span><strong>{s.value}</strong><span className="stage-percent">{dashboard.totalLeads ? Math.round(s.value/dashboard.totalLeads*100) : 0}%</span></div>)}</div><button className="text-link" onClick={() => setPage('Leads')}>View all leads <ArrowUpRight size={14}/></button></div>
    </section>
    <section className="bottom-grid"><div className="panel recent-panel"><div className="panel-heading"><div><h2>Recent leads</h2><p>Your latest prospects and opportunities</p></div><button className="text-link" onClick={() => setPage('Leads')}>View all <ArrowUpRight size={14}/></button></div><LeadTable leads={leads.slice(0,5)} compact onStatus={null} onDelete={null}/></div><div className="panel tasks-panel"><div className="panel-heading"><div><h2>Upcoming follow-ups</h2><p>Don't let a good lead go cold</p></div><button className="icon-btn" onClick={() => setPage('Follow-ups')}><MoreHorizontal size={18}/></button></div>{tasks.slice(0,4).map((task,i)=><div className="task-item" key={task.id}><div className={`task-date ${task.priority?.toLowerCase()}`}>{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'}</div><div className="task-content"><strong>{task.title}</strong><span>{task.customerName || 'Customer'} · {task.assignee || 'Unassigned'}</span></div><span className={`priority-dot ${task.priority?.toLowerCase()}`}/></div>)}{tasks.length===0 && <Empty text="No follow-up tasks yet."/>}<button className="add-task-link" onClick={() => setModal('task')}><Plus size={15}/> Add a follow-up task</button></div></section>
  </>
}

function StatCard({icon:Icon,tint,label,value,trend,direction,foot}) {
  return <div className="stat-card"><div className="stat-top"><div className={`stat-icon ${tint}`}><Icon size={18}/></div><span className={`trend ${direction==='none'?'neutral':''}`}>{direction==='up'&&<ArrowUpRight size={13}/>} {trend}</span></div><div className="stat-label">{label}</div><div className="stat-value">{value ?? 0}</div><div className="stat-foot">{foot}</div></div>
}

function LeadsPage({leads,query,setQuery,filter,setFilter,setModal,setEditingLead,updateStatus,deleteLead}) {
  return <><div className="page-heading"><div><div className="eyebrow"><Target size={13}/> SALES WORKSPACE</div><h1>Leads <span className="heading-count">{leads.length}</span></h1><p>Track every prospect from first touch to closed deal.</p></div><button className="btn-primary" onClick={() => {setEditingLead(null);setModal('lead')}}><Plus size={17}/> Add lead</button></div>
    <div className="panel table-panel"><div className="table-toolbar"><div className="table-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, company, owner..."/></div><div className="toolbar-right"><div className="filter-select"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All stages</option>{stages.map(s=><option key={s}>{s}</option>)}</select></div>
<button
  className="btn-secondary small-btn"
  onClick={() => exportLeadsCSV(leads)}
>
  <Download size={15} /> Export
</button>
</div></div>
      <LeadTable leads={leads} onStatus={updateStatus} onDelete={deleteLead} onEdit={lead => {setEditingLead(lead);setModal('lead')}}/><div className="table-bottom"><span>Showing <strong>{leads.length}</strong> leads</span><span>Changes save to the connected API</span></div></div>
  </>
}

function exportLeadsCSV(leads) {
  if (!leads || leads.length === 0) {
    window.alert('No leads available to export.')
    return
  }

  const columns = [
    ['Name', 'name'],
    ['Company', 'company'],
    ['Email', 'email'],
    ['Phone', 'phone'],
    ['Source', 'source'],
    ['Owner', 'owner'],
    ['Stage', 'status'],
    ['Deal Value', 'dealValue'],
    ['Created Date', 'createdAt']
  ]

  const escapeCSV = value => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  const csv = [
    columns.map(([heading]) => escapeCSV(heading)).join(','),
    ...leads.map(lead =>
      columns
        .map(([, key]) => {
  let value = lead[key]

  if (key === 'createdAt' && value) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      value = date.toLocaleDateString('en-IN')
    }
  }

  return escapeCSV(value)
})
        .join(',')
    )
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'clientflow-leads.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function LeadTable({leads,compact=false,onStatus,onDelete,onEdit}) {
  if (!leads?.length) return <Empty text="No leads match your search. Add a lead to get started."/>
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>CONTACT</th><th>COMPANY</th><th>DEAL VALUE</th><th>STAGE</th><th>OWNER</th>{!compact&&<th>CREATED</th>}{!compact&&<th></th>}</tr></thead><tbody>{leads.map(l=><tr key={l.id}><td><div className="contact-cell"><div className={`contact-avatar avatar-${(l.id||1)%5}`}>{initials(l.name)}</div><div className="contact-meta"><strong>{l.name}</strong><span>{l.email}</span></div></div></td><td><div className="company-cell"><span className="company-logo">{initials(l.company)}</span><span>{l.company}</span></div></td><td className="value-cell">{money(l.dealValue)}</td><td>{onStatus?<select className={`stage-select stage-${(l.status||'new').toLowerCase()}`} value={l.status||'New'} onChange={e=>onStatus(l.id,e.target.value)}>{stages.map(s=><option key={s}>{s}</option>)}</select>:<span className={`stage-pill stage-${(l.status||'new').toLowerCase()}`}><i/>{l.status||'New'}</span>}</td><td><div className="owner-cell"><div className="owner-avatar">{initials(l.owner||'NA')}</div>{l.owner||'Unassigned'}</div></td>{!compact&&<td className="date-cell">{l.createdAt||'—'}</td>}{!compact&&<td><div className="row-actions"><button className="icon-btn row-more" title="Edit lead" onClick={()=>onEdit?.(l)}><Pencil size={15}/></button><button className="icon-btn row-more" title="Delete lead" onClick={()=>onDelete?.(l.id)}><Trash2 size={15}/></button></div></td>}</tr>)}</tbody></table></div>
}
function CustomersPage({customers,query,setQuery,setModal,setEditingCustomer,deleteCustomer}) {
  const filtered = customers.filter(c => [c.name,c.company,c.email,c.industry].join(' ').toLowerCase().includes(query.toLowerCase()))
  return <><div className="page-heading"><div><div className="eyebrow"><Users size={13}/> RELATIONSHIP DIRECTORY</div><h1>Customers <span className="heading-count">{filtered.length}</span></h1><p>Every relationship, company, and conversation in one place.</p></div><button className="btn-primary" onClick={() => {setEditingCustomer(null);setModal('customer')}}><Plus size={17}/> Add customer</button></div>
    <div className="customer-grid">{filtered.map((c,i)=><div className="customer-card" key={c.id}><div className="customer-card-top"><div className={`customer-logo customer-${i%5}`}>{initials(c.company)}</div><span className="active-badge"><i/>{c.status||'Active'}</span><div className="row-actions"><button className="icon-btn" title="Edit customer" onClick={() => {setEditingCustomer(c);setModal('customer')}}><Pencil size={15}/></button><button className="icon-btn" title="Delete customer" onClick={() => deleteCustomer(c.id)}><Trash2 size={15}/></button></div></div><h3>{c.company}</h3><p className="customer-contact">{c.name}</p><div className="customer-detail"><Mail size={15}/>{c.email}</div><div className="customer-detail"><Phone size={15}/>{c.phone||'No phone added'}</div><div className="customer-card-bottom"><span>{c.industry||'Industry not set'}</span><button onClick={() => setModal('lead')}>Create lead <ArrowUpRight size={13}/></button></div></div>)}{filtered.length===0&&<Empty text="No customers found. Add a customer to build your directory."/>}</div>
  </>
}

function TasksPage({
  tasks,
  setModal,
  setEditingTask,
  deleteTask,
  taskQuery,
  setTaskQuery,
  taskStatus,
  setTaskStatus,
  taskPriority,
  setTaskPriority
}) {
  const filteredTasks = tasks.filter(task => {
    const text = [
      task.title,
      task.customerName,
      task.assignee
    ].join(' ').toLowerCase()

    const matchesSearch = text.includes(taskQuery.toLowerCase())

    const matchesStatus =
      taskStatus === 'All statuses' ||
      (task.status || 'Pending') === taskStatus

    const matchesPriority =
      taskPriority === 'All priorities' ||
      (task.priority || 'Medium') === taskPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const ordered = [...filteredTasks].sort((a, b) =>
    (a.dueDate || '').localeCompare(b.dueDate || '')
  )

const today = new Date().toISOString().slice(0, 10)

const isOverdue = task =>
  task.dueDate &&
  task.dueDate.slice(0, 10) < today &&
  (task.status || 'Pending') !== 'Completed'

const overdueCount = tasks.filter(isOverdue).length

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <CalendarClock size={13} /> CUSTOMER SUCCESS
          </div>
          <h1>
            Follow-ups <span className="heading-count">{filteredTasks.length}</span>
          </h1>
          <p>Stay ahead of your next conversation and keep deals moving.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(null)
            setModal('task')
          }}
        >
          <Plus size={17} /> Add follow-up
        </button>
      </div>


      <div className="task-stats">
        <div className="task-stat">
          <span>All tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="task-stat">
          <span>Pending</span>
          <strong>
            {tasks.filter(t => (t.status || 'Pending') !== 'Completed').length}
          </strong>
        </div>

        <div className="task-stat">
          <span>High priority</span>
          <strong>{tasks.filter(t => t.priority === 'High').length}</strong>
        </div>

        <div className="task-stat">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </div>
      </div>

      

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} />
            <input
              value={taskQuery}
              onChange={e => setTaskQuery(e.target.value)}
              placeholder="Search title, customer or assignee..."
            />
          </div>

          <div className="toolbar-right">
            <select
              value={taskStatus}
              onChange={e => setTaskStatus(e.target.value)}
              aria-label="Filter by task status"
            >
              <option>All statuses</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>

            <select
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value)}
              aria-label="Filter by priority"
            >
              <option>All priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button
              className="btn-secondary small-btn"
              onClick={() => {
                setTaskQuery('')
                setTaskStatus('All statuses')
                setTaskPriority('All priorities')
              }}
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="followup-list">
          <div className="panel-heading">
            <div>
              <h2>Task schedule</h2>
              <p>Sorted by upcoming due date</p>
            </div>
            <span className="date-chip">
              <Clock3 size={14} /> Follow-up tasks
            </span>
          </div>

          {ordered.map(task => (
            <div className="followup-row" key={task.id}>
              <div className={`task-date large ${(task.priority || 'Medium').toLowerCase()}`}>
                {task.dueDate
                  ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' }
                    )
                  : '—'}
              </div>

              <div className="followup-main">
                <strong>{task.title}</strong>
                <span>
                  {task.customerName} · Assigned to {task.assignee || 'Unassigned'}
                </span>
              </div>

{isOverdue(task) && (
  <span
    className="status-tag overdue"
    title="This follow-up is past its due date"
  >
    Overdue
  </span>
)}

              <span className={`priority-pill ${(task.priority || 'Medium').toLowerCase()}`}>
                {task.priority || 'Medium'} priority
              </span>

              <span className={`status-tag ${task.status === 'Completed' ? 'completed' : ''}`}>
                {task.status || 'Pending'}
              </span>

              <div className="row-actions">
                <button
                  className="icon-btn"
                  title="Edit follow-up"
                  aria-label="Edit follow-up"
                  onClick={() => {
                    setEditingTask(task)
                    setModal('task')
                  }}
                >
                  <Pencil size={15} />
                </button>

                <button
                  className="icon-btn"
                  title="Delete follow-up"
                  aria-label="Delete follow-up"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {ordered.length === 0 && (
            <Empty text="No follow-ups match these filters." />
          )}
        </div>
      </div>
    </>
  )
}

function ReportsPage({dashboard,leads}) {
  const data=stages.map((name,i)=>({name,count:dashboard.pipeline?.[name]||0,color:colors[i]}))
  const won=leads.filter(l=>l.status==='Won').length
  const conversion=leads.length?Math.round(won/leads.length*100):0
  return <><div className="page-heading"><div><div className="eyebrow"><Activity size={13}/> PERFORMANCE CENTER</div><h1>Reports & insights</h1><p>Understand pipeline health and sales outcomes.</p></div><span className="date-chip"><CalendarClock size={14}/> Live CRM data</span></div>
    <div className="stats-grid report-stats"><StatCard icon={Target} tint="purple" label="Total pipeline leads" value={leads.length} trend="All stages" direction="none" foot="Saved CRM records"/><StatCard icon={Check} tint="green" label="Deals won" value={won} trend={`${conversion}% conversion`} direction="up" foot="Won deals / all leads"/><StatCard icon={CircleDollarSign} tint="blue" label="Revenue won" value={money(dashboard.wonRevenue)} trend="Closed won" direction="none" foot="Sum of won lead values"/><StatCard icon={ClipboardList} tint="orange" label="Open follow-ups" value={dashboard.pendingTasks} trend="Action items" direction="none" foot="Tasks not completed"/></div>
    <div className="panel report-panel"><div className="panel-heading"><div><h2>Lead distribution</h2><p>How leads are spread across your sales stages</p></div></div>{data.map(s=><div className="report-bar-row" key={s.name}><span>{s.name}</span><div className="report-bar-track"><div style={{width:`${leads.length?s.count/leads.length*100:0}%`,background:s.color}}/></div><strong>{s.count}</strong><span className="stage-percent">{leads.length?Math.round(s.count/leads.length*100):0}%</span></div>)}</div>
  </>
}
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label> }
function Modal({title,subtitle,onClose,children}) { return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div> }
function CustomerForm({initialData,onCancel,onSave}) {
  async function submit(e) { e.preventDefault(); const f=new FormData(e.currentTarget); await onSave({name:f.get('name'),company:f.get('company'),email:f.get('email'),phone:f.get('phone'),industry:f.get('industry'),status:'Active'}) }
  return <form className="modal-form" onSubmit={submit}><div className="form-grid"><Field label="Contact name"><input name="name" required defaultValue={initialData?.name || ''} placeholder="Full name"/></Field><Field label="Company"><input name="company" required defaultValue={initialData?.company || ''} placeholder="Company name"/></Field><Field label="Email"><input name="email" type="email" required defaultValue={initialData?.email || ''} placeholder="name@company.com"/></Field><Field label="Phone"><input name="phone" defaultValue={initialData?.phone || ''} placeholder="+91..."/></Field><Field label="Industry"><select name="industry" defaultValue={initialData?.industry || 'Technology'}><option>Technology</option><option>Retail</option><option>Finance</option><option>Healthcare</option><option>Education</option><option>Other</option></select></Field></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button><button className="btn-primary" type="submit"><Plus size={16}/> {initialData ? "Save changes" : "Save customer"}</button></div></form>
}
function Empty({text}) { return <div className="empty-state"><div><BriefcaseBusiness size={22}/></div><p>{text}</p></div> }
